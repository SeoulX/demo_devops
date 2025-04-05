module "ttVPC" {
  source = "./modules/vpc"

  project_name    = var.project_name
  vpc_cidr        = var.vpc_cidr
  aws_region      = var.aws_region
  azs             = var.azs
  public_subnets  = var.public_subnets
  private_subnets = var.private_subnets
}

module "Table" {
  source = "./modules/dynamodb"

  project_name = var.project_name
  table_name1  = var.table_name1
  table_name2  = var.table_name2
}

module "ECS" {
  source = "./modules/ecs"

  project_name = var.project_name
  aws_region   = var.aws_region
  fastapi_image_url   = var.fastapi_image_url
  nextjs_image_url    = var.nextjs_image_url
  dynamodb_table_arns = [
    var.dynamodb_table_arns[0],
    var.dynamodb_table_arns[1]
  ]
}