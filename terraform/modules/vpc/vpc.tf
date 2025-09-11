# VPC
resource "aws_vpc" "ttVPC" {
  cidr_block = var.vpc_cidr
  enable_dns_support = true
  enable_dns_hostnames = true
  instance_tenancy = "default"
  assign_generated_ipv6_cidr_block = true
  tags = {
    Name = "${var.project_name}-VPC"
  }
}

# Public and Private Subnets
resource "aws_subnet" "public_sub" {
  count                   = length(var.public_subnets)
  vpc_id                  = aws_vpc.ttVPC.id
  cidr_block              = var.public_subnets[count.index]
  availability_zone       = var.azs[count.index]
  map_public_ip_on_launch = true

  ipv6_cidr_block         = cidrsubnet(aws_vpc.ttVPC.ipv6_cidr_block, 8, count.index)
  assign_ipv6_address_on_creation = true

  tags = {
    Name = "${var.project_name}-public-${count.index}"
  }
}

resource "aws_subnet" "private_sub" {
  count             = length(var.private_subnets)
  vpc_id            = aws_vpc.ttVPC.id
  cidr_block        = var.private_subnets[count.index]
  availability_zone = var.azs[count.index]

  ipv6_cidr_block   = cidrsubnet(aws_vpc.ttVPC.ipv6_cidr_block, 8, count.index + length(var.public_subnets))
  assign_ipv6_address_on_creation = true

  tags = {
    Name = "${var.project_name}-private-${count.index}"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.ttVPC.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

# Route Tables
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.ttVPC.id

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

resource "aws_route_table_association" "public_rta" {
  count          = length(var.public_subnets)
  subnet_id      = aws_subnet.public_sub[count.index].id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route" "internet_access_ipv4" {
  route_table_id         = aws_route_table.public_rt.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.igw.id
}

resource "aws_route" "internet_access_ipv6" {
  route_table_id         = aws_route_table.public_rt.id
  destination_ipv6_cidr_block = "::/0"
  gateway_id             = aws_internet_gateway.igw.id
  
}

resource "aws_route_table" "private_rt_az1" {
  vpc_id = aws_vpc.ttVPC.id

  tags = {
    Name = "${var.project_name}-private-rt-az1"
  }
}

resource "aws_route_table" "private_rt_az2" {
  vpc_id = aws_vpc.ttVPC.id

  tags = {
    Name = "${var.project_name}-private-rt-az2"
  }
}
resource "aws_route_table_association" "private_rta_az1" {
  subnet_id      = aws_subnet.private_sub[0].id
  route_table_id = aws_route_table.private_rt_az1.id
}

resource "aws_route_table_association" "private_rta_az2" {
  subnet_id      = aws_subnet.private_sub[1].id
  route_table_id = aws_route_table.private_rt_az2.id
}
resource "aws_eip" "nat_ip" {
  count = length(var.public_subnets)
  domain = "vpc"
}
resource "aws_nat_gateway" "nat_gw" {
  count        = length(var.public_subnets)
  allocation_id = aws_eip.nat_ip[count.index].id
  subnet_id     = aws_subnet.public_sub[count.index].id

  tags = {
    Name = "${var.project_name}-nat-gw-${count.index}"
  }
}

resource "aws_route" "private_route_nat1" {
  route_table_id         = aws_route_table.private_rt_az1.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.nat_gw[0].id

  depends_on = [
    aws_subnet.private_sub[0],
    aws_nat_gateway.nat_gw[0]
  ]
}
resource "aws_route" "private_route_nat2" {
  route_table_id         = aws_route_table.private_rt_az2.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.nat_gw[1].id

  depends_on = [
    aws_subnet.private_sub[1],
    aws_nat_gateway.nat_gw[1]
  ]
}
# resource "aws_vpc_endpoint" "dynamodb_endpoint" {
#   vpc_id            = aws_vpc.ttVPC.id
#   service_name      = "com.amazonaws.${var.aws_region}.dynamodb"
#   vpc_endpoint_type = "Gateway"
#   route_table_ids   = [aws_route_table.private_rt.id]

#   tags = {
#     Name = "${var.project_name}-dynamodb-endpoint"
#   }
# }
