output "alb_dns_name" {
  value = aws_lb.this.dns_name
}
output "alb_sg_id" {
  value = aws_security_group.alb_sg.id
}

output "fastapi_tg_arn" {
  value = aws_lb_target_group.fastapi_tg.arn
}

output "nextjs_tg_arn" {
  value = aws_lb_target_group.nextjs_tg.arn
}

output "http_listener_arn" {
  value = aws_lb_listener.http.arn
}
