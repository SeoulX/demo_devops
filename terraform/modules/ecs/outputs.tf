output "ecs_cluster_id" {
  value = aws_ecs_cluster.main.id
}

output "fastapi_task_definition_arn" {
  value = aws_ecs_task_definition.fastapi.arn
}

output "nextjs_task_definition_arn" {
  value = aws_ecs_task_definition.nextjs.arn
}

output "task_role_arn" {
  value = aws_iam_role.task_role.arn
}
