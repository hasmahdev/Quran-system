# Stage 1: Build the Go binary
FROM golang:1.24.3-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies. Dependencies will be cached if the go.mod and go.sum files are not changed
RUN go mod download

# Copy the source code from the current directory to the working Directory inside the container
COPY . .

# Build the Go app
# CGO_ENABLED=0 is important for creating a static binary that can run in a minimal Alpine image.
# -o /main specifies the output file name and location.
RUN CGO_ENABLED=0 GOOS=linux go build -o /main .

# Stage 2: Create the final, lightweight image
FROM alpine:latest

# Set the working directory
WORKDIR /root/

# Copy the pre-built binary file from the previous stage
COPY --from=builder /main .

# Expose port 3001 to the outside world
EXPOSE 3001

# Command to run the executable
CMD ["./main"]
