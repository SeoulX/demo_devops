module "VPC" {
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

  project_name          = var.project_name
  aws_region            = var.aws_region
  fastapi_image_url     = var.fastapi_image_url
  nextjs_image_url      = var.nextjs_image_url
  vpc_id                = module.VPC.vpc_id
  public_subnet_ids     = module.VPC.public_subnet_ids
  private_subnet_ids    = module.VPC.private_subnet_ids
  AWS_ACCESS_KEY_ID     = var.AWS_ACCESS_KEY_ID
  AWS_SECRET_ACCESS_KEY = var.AWS_SECRET_ACCESS_KEY
  JWT_SECRET            = var.JWT_SECRET
  alb_dns_name          = module.ALB.alb_dns_name

  dynamodb_table_arns = [
    module.Table.table_name1_arn,
    module.Table.table_name2_arn
  ]

  alb_sg_id        = module.ALB.alb_sg_id
  alb_listener_arn = module.ALB.http_listener_arn

  alb_target_group_arns = {
    fastapi = module.ALB.fastapi_tg_arn
    nextjs  = module.ALB.nextjs_tg_arn
  }
}


module "ALB" {
  source = "./modules/alb"

  project_name       = var.project_name
  aws_region         = var.aws_region
  vpc_id             = module.VPC.vpc_id
  public_subnet_ids  = module.VPC.public_subnet_ids
  private_subnet_ids = module.VPC.private_subnet_ids
  fastapi_image_url  = var.fastapi_image_url
  nextjs_image_url   = var.nextjs_image_url
}