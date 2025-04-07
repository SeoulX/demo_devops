resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"

  tags = {
    Name = "${var.project_name}-ecs-cluster"
  }
}

# --- IAM Execution Role ---
resource "aws_iam_role" "execution_role" {
  name = "${var.project_name}-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })
}
resource "aws_iam_role_policy_attachment" "execution_attach" {
  role       = aws_iam_role.execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}
# --- IAM Task Role ---
resource "aws_iam_role" "task_role" {
  name = "${var.project_name}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_policy" "dynamodb_access" {
  name = "${var.project_name}-dynamodb-access"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Action = [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      Resource = var.dynamodb_table_arns
    }]
  })
}
resource "aws_iam_role_policy_attachment" "dynamodb_attach" {
  role       = aws_iam_role.task_role.name
  policy_arn = aws_iam_policy.dynamodb_access.arn
}

# --- ECS Task Definitions ---
resource "aws_ecs_task_definition" "fastapi" {
  family                   = "${var.project_name}-fastapi"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.execution_role.arn
  task_role_arn            = aws_iam_role.task_role.arn

  container_definitions = jsonencode([
    {
      name      = "fastapi-app",
      image = "${var.fastapi_image_url}"
      essential = true,
      portMappings = [{
        containerPort = 8000,
        protocol      = "tcp"
      }],
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = "/ecs/${var.project_name}/fastapi",
          awslogs-region        = var.aws_region,
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "nextjs" {
  family                   = "${var.project_name}-nextjs"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.execution_role.arn
  task_role_arn            = aws_iam_role.task_role.arn

  container_definitions = jsonencode([
    {
      name      = "nextjs-app",
      image = "${var.nextjs_image_url}"
      essential = true,
      portMappings = [{
        containerPort = 3000,
        protocol      = "tcp"
      }],
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = "/ecs/${var.project_name}/nextjs",
          awslogs-region        = var.aws_region,
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecr_repository" "repo_backend" {
  name = "aadinnr/${var.project_name}-backend"
}
resource "aws_ecr_repository" "repo_frontend" {
  name = "aadinnr/${var.project_name}-frontend"
}


resource "aws_ecs_service" "nextjs" {
  name            = "${var.project_name}-nextjs-service"
  cluster         = aws_ecs_cluster.main.id
  launch_type     = "FARGATE"
  desired_count   = 1
  task_definition = aws_ecs_task_definition.nextjs.arn

  network_configuration {
    subnets         = var.public_subnet_ids
    assign_public_ip = true
    security_groups = [var.alb_sg_id]
  }

  load_balancer {
    target_group_arn = var.alb_target_group_arns.nextjs
    container_name   = "nextjs-app"
    container_port   = 3000
  }

  depends_on = [var.alb_listener_arn]
}

resource "aws_ecs_service" "fastapi" {
  name            = "${var.project_name}-fastapi-service"
  cluster         = aws_ecs_cluster.main.id
  launch_type     = "FARGATE"
  desired_count   = 1
  task_definition = aws_ecs_task_definition.fastapi.arn

  network_configuration {
    subnets         = var.private_subnet_ids
    assign_public_ip = false
    security_groups = [var.alb_sg_id]
  }

  load_balancer {
    target_group_arn = var.alb_target_group_arns.fastapi
    container_name   = "fastapi-app"
    container_port   = 8000
  }

  depends_on = [var.alb_listener_arn]
}
