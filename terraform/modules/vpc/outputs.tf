output "vpc_id" {
  value = aws_vpc.ttVPC.id
}

output "public_subnet_ids" {
  value = aws_subnet.public_sub[*].id
}

output "private_subnet_ids" {
  value = aws_subnet.private_sub[*].id
}
