# Go binaries
backend
\n\n---\n\n
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

# Expose port 3002 to the outside world
EXPOSE 3002

# Command to run the executable
CMD ["./main"]
\n\n---\n\n
-- Create the users table if it doesn't already exist
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('developer', 'admin', 'user', 'teacher', 'student')),
    phone TEXT
);

-- Insert the developer user if they don't exist, or update their password if they do.
-- This "upsert" command ensures the password is correct without causing errors on re-runs.
INSERT INTO users (username, password, role) VALUES
('developer', '$2a$10$Vk5cjiLPNYzNT3UZPfpqJuzHFz0EWC1bHrsao61LiCeTCWy18XdLq', 'developer')
ON CONFLICT (username) DO UPDATE SET
password = EXCLUDED.password;

-- Create the classes table if it doesn't already exist
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create the class_members join table if it doesn't already exist
CREATE TABLE IF NOT EXISTS class_members (
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (class_id, student_id)
);

-- Create the progress table if it doesn't already exist
CREATE TABLE IF NOT EXISTS progress (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    surah INTEGER,
    ayah INTEGER,
    page INTEGER,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by INTEGER NOT NULL REFERENCES users(id),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);
\n\n---\n\n
DATABASE_URL=""
JWT_SECRET=""
\n\n---\n\n
module github.com/kolind-am/quran-project/backend

go 1.24.3

require (
	github.com/gofiber/fiber/v2 v2.52.9
	github.com/gofiber/jwt/v3 v3.3.10
	github.com/golang-jwt/jwt/v4 v4.5.2
	github.com/jackc/pgx/v4 v4.18.3
	golang.org/x/crypto v0.43.0
)

require (
	github.com/andybalholm/brotli v1.1.0 // indirect
	github.com/google/uuid v1.6.0 // indirect
	github.com/jackc/chunkreader/v2 v2.0.1 // indirect
	github.com/jackc/pgconn v1.14.3 // indirect
	github.com/jackc/pgio v1.0.0 // indirect
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgproto3/v2 v2.3.3 // indirect
	github.com/jackc/pgservicefile v0.0.0-20221227161230-091c0ba34f0a // indirect
	github.com/jackc/pgtype v1.14.0 // indirect
	github.com/jackc/puddle v1.3.0 // indirect
	github.com/klauspost/compress v1.17.9 // indirect
	github.com/mattn/go-colorable v0.1.13 // indirect
	github.com/mattn/go-isatty v0.0.20 // indirect
	github.com/mattn/go-runewidth v0.0.16 // indirect
	github.com/rivo/uniseg v0.2.0 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/valyala/fasthttp v1.51.0 // indirect
	github.com/valyala/tcplisten v1.0.0 // indirect
	golang.org/x/sys v0.37.0 // indirect
	golang.org/x/text v0.30.0 // indirect
)
\n\n---\n\n
github.com/BurntSushi/toml v0.3.1/go.mod h1:xHWCNGjB5oqiDr8zfno3MHue2Ht5sIBksp03qcyfWMU=
github.com/Masterminds/semver/v3 v3.1.1/go.mod h1:VPu/7SZ7ePZ3QOrcuXROw5FAcLl4a0cBrbBpGY/8hQs=
github.com/andybalholm/brotli v1.0.5/go.mod h1:fO7iG3H7G2nSZ7m0zPUDn85XEX2GTukHGRSepvi9Eig=
github.com/andybalholm/brotli v1.1.0 h1:eLKJA0d02Lf0mVpIDgYnqXcUn0GqVmEFny3VuID1U3M=
github.com/andybalholm/brotli v1.1.0/go.mod h1:sms7XGricyQI9K10gOSf56VKKWS4oLer58Q+mhRPtnY=
github.com/cockroachdb/apd v1.1.0 h1:3LFP3629v+1aKXU5Q37mxmRxX/pIu1nijXydLShEq5I=
github.com/cockroachdb/apd v1.1.0/go.mod h1:8Sl8LxpKi29FqWXR16WEFZRNSz3SoPzUzeMeY4+DwBQ=
github.com/coreos/go-systemd v0.0.0-20190321100706-95778dfbb74e/go.mod h1:F5haX7vjVVG0kc13fIWeqUViNPyEJxv/OmvnBo0Yme4=
github.com/coreos/go-systemd v0.0.0-20190719114852-fd7a80b32e1f/go.mod h1:F5haX7vjVVG0kc13fIWeqUViNPyEJxv/OmvnBo0Yme4=
github.com/creack/pty v1.1.7/go.mod h1:lj5s0c3V2DBrqTV7llrYr5NG6My20zk30Fl46Y7DoTY=
github.com/davecgh/go-spew v1.1.0/go.mod h1:J7Y8YcW2NihsgmVo/mv3lAwl/skON4iLHjSsI+c5H38=
github.com/davecgh/go-spew v1.1.1 h1:vj9j/u1bqnvCEfJOwUhtlOARqs3+rkHYY13jYWTU97c=
github.com/davecgh/go-spew v1.1.1/go.mod h1:J7Y8YcW2NihsgmVo/mv3lAwl/skON4iLHjSsI+c5H38=
github.com/go-kit/log v0.1.0/go.mod h1:zbhenjAZHb184qTLMA9ZjW7ThYL0H2mk7Q6pNt4vbaY=
github.com/go-logfmt/logfmt v0.5.0/go.mod h1:wCYkCAKZfumFQihp8CzCvQ3paCTfi41vtzG1KdI/P7A=
github.com/go-stack/stack v1.8.0/go.mod h1:v0f6uXyyMGvRgIKkXu+yp6POWl0qKG85gN/melR3HDY=
github.com/gofiber/fiber/v2 v2.45.0/go.mod h1:DNl0/c37WLe0g92U6lx1VMQuxGUQY5V7EIaVoEsUffc=
github.com/gofiber/fiber/v2 v2.52.9 h1:YjKl5DOiyP3j0mO61u3NTmK7or8GzzWzCFzkboyP5cw=
github.com/gofiber/fiber/v2 v2.52.9/go.mod h1:YEcBbO/FB+5M1IZNBP9FO3J9281zgPAreiI1oqg8nDw=
github.com/gofiber/jwt/v3 v3.3.10 h1:0bpWtFKaGepjwYTU4efHfy0o+matSqZwTxGMo5a+uuc=
github.com/gofiber/jwt/v3 v3.3.10/go.mod h1:GJorFVaDyfMPSK9RB8RG4NQ3s1oXKTmYaoL/ny08O1A=
github.com/gofrs/uuid v4.0.0+incompatible h1:1SD/1F5pU8p29ybwgQSwpQk+mwdRrXCYuPhW6m+TnJw=
github.com/gofrs/uuid v4.0.0+incompatible/go.mod h1:b2aQJv3Z4Fp6yNu3cdSllBxTCLRxnplIgP/c0N/04lM=
github.com/golang-jwt/jwt/v4 v4.5.0/go.mod h1:m21LjoU+eqJr34lmDMbreY2eSTRJ1cv77w39/MY0Ch0=
github.com/golang-jwt/jwt/v4 v4.5.2 h1:YtQM7lnr8iZ+j5q71MGKkNw9Mn7AjHM68uc9g5fXeUI=
github.com/golang-jwt/jwt/v4 v4.5.2/go.mod h1:m21LjoU+eqJr34lmDMbreY2eSTRJ1cv77w39/MY0Ch0=
github.com/google/renameio v0.1.0/go.mod h1:KWCgfxg9yswjAJkECMjeO8J8rahYeXnNhOm40UhjYkI=
github.com/google/uuid v1.3.0/go.mod h1:TIyPZe4MgqvfeYDBFedMoGGpEw/LqOeaOT+nhxU+yHo=
github.com/google/uuid v1.6.0 h1:NIvaJDMOsjHA8n1jAhLSgzrAzy1Hgr+hNrb57e+94F0=
github.com/google/uuid v1.6.0/go.mod h1:TIyPZe4MgqvfeYDBFedMoGGpEw/LqOeaOT+nhxU+yHo=
github.com/jackc/chunkreader v1.0.0/go.mod h1:RT6O25fNZIuasFJRyZ4R/Y2BbhasbmZXF9QQ7T3kePo=
github.com/jackc/chunkreader/v2 v2.0.0/go.mod h1:odVSm741yZoC3dpHEUXIqA9tQRhFrgOHwnPIn9lDKlk=
github.com/jackc/chunkreader/v2 v2.0.1 h1:i+RDz65UE+mmpjTfyz0MoVTnzeYxroil2G82ki7MGG8=
github.com/jackc/chunkreader/v2 v2.0.1/go.mod h1:odVSm741yZoC3dpHEUXIqA9tQRhFrgOHwnPIn9lDKlk=
github.com/jackc/pgconn v0.0.0-20190420214824-7e0022ef6ba3/go.mod h1:jkELnwuX+w9qN5YIfX0fl88Ehu4XC3keFuOJJk9pcnA=
github.com/jackc/pgconn v0.0.0-20190824142844-760dd75542eb/go.mod h1:lLjNuW/+OfW9/pnVKPazfWOgNfH2aPem8YQ7ilXGvJE=
github.com/jackc/pgconn v0.0.0-20190831204454-2fabfa3c18b7/go.mod h1:ZJKsE/KZfsUgOEh9hBm+xYTstcNHg7UPMVJqRfQxq4s=
github.com/jackc/pgconn v1.8.0/go.mod h1:1C2Pb36bGIP9QHGBYCjnyhqu7Rv3sGshaQUvmfGIB/o=
github.com/jackc/pgconn v1.9.0/go.mod h1:YctiPyvzfU11JFxoXokUOOKQXQmDMoJL9vJzHH8/2JY=
github.com/jackc/pgconn v1.9.1-0.20210724152538-d89c8390a530/go.mod h1:4z2w8XhRbP1hYxkpTuBjTS3ne3J48K83+u0zoyvg2pI=
github.com/jackc/pgconn v1.14.3 h1:bVoTr12EGANZz66nZPkMInAV/KHD2TxH9npjXXgiB3w=
github.com/jackc/pgconn v1.14.3/go.mod h1:RZbme4uasqzybK2RK5c65VsHxoyaml09lx3tXOcO/VM=
github.com/jackc/pgio v1.0.0 h1:g12B9UwVnzGhueNavwioyEEpAmqMe1E/BN9ES+8ovkE=
github.com/jackc/pgio v1.0.0/go.mod h1:oP+2QK2wFfUWgr+gxjoBH9KGBb31Eio69xUb0w5bYf8=
github.com/jackc/pgmock v0.0.0-20190831213851-13a1b77aafa2/go.mod h1:fGZlG77KXmcq05nJLRkk0+p82V8B8Dw8KN2/V9c/OAE=
github.com/jackc/pgmock v0.0.0-20201204152224-4fe30f7445fd/go.mod h1:hrBW0Enj2AZTNpt/7Y5rr2xe/9Mn757Wtb2xeBzPv2c=
github.com/jackc/pgmock v0.0.0-20210724152146-4ad1a8207f65 h1:DadwsjnMwFjfWc9y5Wi/+Zz7xoE5ALHsRQlOctkOiHc=
github.com/jackc/pgmock v0.0.0-20210724152146-4ad1a8207f65/go.mod h1:5R2h2EEX+qri8jOWMbJCtaPWkrrNc7OHwsp2TCqp7ak=
github.com/jackc/pgpassfile v1.0.0 h1:/6Hmqy13Ss2zCq62VdNG8tM1wchn8zjSGOBJ6icpsIM=
github.com/jackc/pgpassfile v1.0.0/go.mod h1:CEx0iS5ambNFdcRtxPj5JhEz+xB6uRky5eyVu/W2HEg=
github.com/jackc/pgproto3 v1.1.0/go.mod h1:eR5FA3leWg7p9aeAqi37XOTgTIbkABlvcPB3E5rlc78=
github.com/jackc/pgproto3/v2 v2.0.0-alpha1.0.20190420180111-c116219b62db/go.mod h1:bhq50y+xrl9n5mRYyCBFKkpRVTLYJVWeCc+mEAI3yXA=
github.com/jackc/pgproto3/v2 v2.0.0-alpha1.0.20190609003834-432c2951c711/go.mod h1:uH0AWtUmuShn0bcesswc4aBTWGvw0cAxIJp+6OB//Wg=
github.com/jackc/pgproto3/v2 v2.0.0-rc3/go.mod h1:ryONWYqW6dqSg1Lw6vXNMXoBJhpzvWKnT95C46ckYeM=
github.com/jackc/pgproto3/v2 v2.0.0-rc3.0.20190831210041-4c03ce451f29/go.mod h1:ryONWYqW6dqSg1Lw6vXNMXoBJhpzvWKnT95C46ckYeM=
github.com/jackc/pgproto3/v2 v2.0.6/go.mod h1:WfJCnwN3HIg9Ish/j3sgWXnAfK8A9Y0bwXYU5xKaEdA=
github.com/jackc/pgproto3/v2 v2.1.1/go.mod h1:WfJCnwN3HIg9Ish/j3sgWXnAfK8A9Y0bwXYU5xKaEdA=
github.com/jackc/pgproto3/v2 v2.3.3 h1:1HLSx5H+tXR9pW3in3zaztoEwQYRC9SQaYUHjTSUOag=
github.com/jackc/pgproto3/v2 v2.3.3/go.mod h1:WfJCnwN3HIg9Ish/j3sgWXnAfK8A9Y0bwXYU5xKaEdA=
github.com/jackc/pgservicefile v0.0.0-20200714003250-2b9c44734f2b/go.mod h1:vsD4gTJCa9TptPL8sPkXrLZ+hDuNrZCnj29CQpr4X1E=
github.com/jackc/pgservicefile v0.0.0-20221227161230-091c0ba34f0a h1:bbPeKD0xmW/Y25WS6cokEszi5g+S0QxI/d45PkRi7Nk=
github.com/jackc/pgservicefile v0.0.0-20221227161230-091c0ba34f0a/go.mod h1:5TJZWKEWniPve33vlWYSoGYefn3gLQRzjfDlhSJ9ZKM=
github.com/jackc/pgtype v0.0.0-20190421001408-4ed0de4755e0/go.mod h1:hdSHsc1V01CGwFsrv11mJRHWJ6aifDLfdV3aVjFF0zg=
github.com/jackc/pgtype v0.0.0-20190824184912-ab885b375b90/go.mod h1:KcahbBH1nCMSo2DXpzsoWOAfFkdEtEJpPbVLq8eE+mc=
github.com/jackc/pgtype v0.0.0-20190828014616-a8802b16cc59/go.mod h1:MWlu30kVJrUS8lot6TQqcg7mtthZ9T0EoIBFiJcmcyw=
github.com/jackc/pgtype v1.8.1-0.20210724151600-32e20a603178/go.mod h1:C516IlIV9NKqfsMCXTdChteoXmwgUceqaLfjg2e3NlM=
github.com/jackc/pgtype v1.14.0 h1:y+xUdabmyMkJLyApYuPj38mW+aAIqCe5uuBB51rH3Vw=
github.com/jackc/pgtype v1.14.0/go.mod h1:LUMuVrfsFfdKGLw+AFFVv6KtHOFMwRgDDzBt76IqCA4=
github.com/jackc/pgx/v4 v4.0.0-20190420224344-cc3461e65d96/go.mod h1:mdxmSJJuR08CZQyj1PVQBHy9XOp5p8/SHH6a0psbY9Y=
github.com/jackc/pgx/v4 v4.0.0-20190421002000-1b8f0016e912/go.mod h1:no/Y67Jkk/9WuGR0JG/JseM9irFbnEPbuWV2EELPNuM=
github.com/jackc/pgx/v4 v4.0.0-pre1.0.20190824185557-6972a5742186/go.mod h1:X+GQnOEnf1dqHGpw7JmHqHc1NxDoalibchSk9/RWuDc=
github.com/jackc/pgx/v4 v4.12.1-0.20210724153913-640aa07df17c/go.mod h1:1QD0+tgSXP7iUjYm9C1NxKhny7lq6ee99u/z+IHFcgs=
github.com/jackc/pgx/v4 v4.18.3 h1:dE2/TrEsGX3RBprb3qryqSV9Y60iZN1C6i8IrmW9/BA=
github.com/jackc/pgx/v4 v4.18.3/go.mod h1:Ey4Oru5tH5sB6tV7hDmfWFahwF15Eb7DNXlRKx2CkVw=
github.com/jackc/puddle v0.0.0-20190413234325-e4ced69a3a2b/go.mod h1:m4B5Dj62Y0fbyuIc15OsIqK0+JU8nkqQjsgx7dvjSWk=
github.com/jackc/puddle v0.0.0-20190608224051-11cab39313c9/go.mod h1:m4B5Dj62Y0fbyuIc15OsIqK0+JU8nkqQjsgx7dvjSWk=
github.com/jackc/puddle v1.1.3/go.mod h1:m4B5Dj62Y0fbyuIc15OsIqK0+JU8nkqQjsgx7dvjSWk=
github.com/jackc/puddle v1.3.0 h1:eHK/5clGOatcjX3oWGBO/MpxpbHzSwud5EWTSCI+MX0=
github.com/jackc/puddle v1.3.0/go.mod h1:m4B5Dj62Y0fbyuIc15OsIqK0+JU8nkqQjsgx7dvjSWk=
github.com/kisielk/gotool v1.0.0/go.mod h1:XhKaO+MFFWcvkIS/tQcRk01m1F5IRFswLeQ+oQHNcck=
github.com/klauspost/compress v1.16.3/go.mod h1:ntbaceVETuRiXiv4DpjP66DpAtAGkEQskQzEyD//IeE=
github.com/klauspost/compress v1.17.9 h1:6KIumPrER1LHsvBVuDa0r5xaG0Es51mhhB9BQB2qeMA=
github.com/klauspost/compress v1.17.9/go.mod h1:Di0epgTjJY877eYKx5yC51cX2A2Vl2ibi7bDH9ttBbw=
github.com/konsorten/go-windows-terminal-sequences v1.0.1/go.mod h1:T0+1ngSBFLxvqU3pZ+m/2kptfBszLMUkC4ZK/EgS/cQ=
github.com/konsorten/go-windows-terminal-sequences v1.0.2/go.mod h1:T0+1ngSBFLxvqU3pZ+m/2kptfBszLMUkC4ZK/EgS/cQ=
github.com/kr/pretty v0.1.0/go.mod h1:dAy3ld7l9f0ibDNOQOHHMYYIIbhfbHSm3C4ZsoJORNo=
github.com/kr/pty v1.1.1/go.mod h1:pFQYn66WHrOpPYNljwOMqo10TkYh1fy3cYio2l3bCsQ=
github.com/kr/pty v1.1.8/go.mod h1:O1sed60cT9XZ5uDucP5qwvh+TE3NnUj51EiZO/lmSfw=
github.com/kr/text v0.1.0/go.mod h1:4Jbv+DJW3UT/LiOwJeYQe1efqtUx/iVham/4vfdArNI=
github.com/lib/pq v1.0.0/go.mod h1:5WUZQaWbwv1U+lTReE5YruASi9Al49XbQIvNi/34Woo=
github.com/lib/pq v1.1.0/go.mod h1:5WUZQaWbwv1U+lTReE5YruASi9Al49XbQIvNi/34Woo=
github.com/lib/pq v1.2.0/go.mod h1:5WUZQaWbwv1U+lTReE5YruASi9Al49XbQIvNi/34Woo=
github.com/lib/pq v1.10.2 h1:AqzbZs4ZoCBp+GtejcpCpcxM3zlSMx29dXbUSeVtJb8=
github.com/lib/pq v1.10.2/go.mod h1:AlVN5x4E4T544tWzH6hKfbfQvm3HdbOxrmggDNAPY9o=
github.com/mattn/go-colorable v0.1.1/go.mod h1:FuOcm+DKB9mbwrcAfNl7/TZVBZ6rcnceauSikq3lYCQ=
github.com/mattn/go-colorable v0.1.6/go.mod h1:u6P/XSegPjTcexA+o6vUJrdnUu04hMope9wVRipJSqc=
github.com/mattn/go-colorable v0.1.13 h1:fFA4WZxdEF4tXPZVKMLwD8oUnCTTo08duU7wxecdEvA=
github.com/mattn/go-colorable v0.1.13/go.mod h1:7S9/ev0klgBDR4GtXTXX8a3vIGJpMovkB8vQcUbaXHg=
github.com/mattn/go-isatty v0.0.5/go.mod h1:Iq45c/XA43vh69/j3iqttzPXn0bhXyGjM0Hdxcsrc5s=
github.com/mattn/go-isatty v0.0.7/go.mod h1:Iq45c/XA43vh69/j3iqttzPXn0bhXyGjM0Hdxcsrc5s=
github.com/mattn/go-isatty v0.0.12/go.mod h1:cbi8OIDigv2wuxKPP5vlRcQ1OAZbq2CE4Kysco4FUpU=
github.com/mattn/go-isatty v0.0.16/go.mod h1:kYGgaQfpe5nmfYZH+SKPsOc2e4SrIfOl2e/yFXSvRLM=
github.com/mattn/go-isatty v0.0.18/go.mod h1:W+V8PltTTMOvKvAeJH7IuucS94S2C6jfK/D7dTCTo3Y=
github.com/mattn/go-isatty v0.0.20 h1:xfD0iDuEKnDkl03q4limB+vH+GxLEtL/jb4xVJSWWEY=
github.com/mattn/go-isatty v0.0.20/go.mod h1:W+V8PltTTMOvKvAeJH7IuucS94S2C6jfK/D7dTCTo3Y=
github.com/mattn/go-runewidth v0.0.14/go.mod h1:Jdepj2loyihRzMpdS35Xk/zdY8IAYHsh153qUoGf23w=
github.com/mattn/go-runewidth v0.0.16 h1:E5ScNMtiwvlvB5paMFdw9p4kSQzbXFikJ5SQO6TULQc=
github.com/mattn/go-runewidth v0.0.16/go.mod h1:Jdepj2loyihRzMpdS35Xk/zdY8IAYHsh153qUoGf23w=
github.com/philhofer/fwd v1.1.1/go.mod h1:gk3iGcWd9+svBvR0sR+KPcfE+RNWozjowpeBVG3ZVNU=
github.com/philhofer/fwd v1.1.2/go.mod h1:qkPdfjR2SIEbspLqpe1tO4n5yICnr2DY7mqEx2tUTP0=
github.com/pkg/errors v0.8.1 h1:iURUrRGxPUNPdy5/HRSm+Yj6okJ6UtLINN0Q9M4+h3I=
github.com/pkg/errors v0.8.1/go.mod h1:bwawxfHBFNV+L2hUp1rHADufV3IMtnDRdf1r5NINEl0=
github.com/pmezard/go-difflib v1.0.0 h1:4DBwDE0NGyQoBHbLQYPwSUPoCMWR5BEzIk/f1lZbAQM=
github.com/pmezard/go-difflib v1.0.0/go.mod h1:iKH77koFhYxTK1pcRnkKkqfTogsbg7gZNVY4sRDYZ/4=
github.com/rivo/uniseg v0.2.0 h1:S1pD9weZBuJdFmowNwbpi7BJ8TNftyUImj/0WQi72jY=
github.com/rivo/uniseg v0.2.0/go.mod h1:J6wj4VEh+S6ZtnVlnTBMWIodfgj8LQOQFoIToxlJtxc=
github.com/rogpeppe/go-internal v1.3.0/go.mod h1:M8bDsm7K2OlrFYOpmOWEs/qY81heoFRclV5y23lUDJ4=
github.com/rs/xid v1.2.1/go.mod h1:+uKXf+4Djp6Md1KODXJxgGQPKngRmWyn10oCKFzNHOQ=
github.com/rs/zerolog v1.13.0/go.mod h1:YbFCdg8HfsridGWAh22vktObvhZbQsZXe4/zB0OKkWU=
github.com/rs/zerolog v1.15.0/go.mod h1:xYTKnLHcpfU2225ny5qZjxnj9NvkumZYjJHlAThCjNc=
github.com/satori/go.uuid v1.2.0/go.mod h1:dA0hQrYB0VpLJoorglMZABFdXlWrHn1NEOzdhQKdks0=
github.com/savsgio/dictpool v0.0.0-20221023140959-7bf2e61cea94/go.mod h1:90zrgN3D/WJsDd1iXHT96alCoN2KJo6/4x1DZC3wZs8=
github.com/savsgio/gotils v0.0.0-20220530130905-52f3993e8d6d/go.mod h1:Gy+0tqhJvgGlqnTF8CVGP0AaGRjwBtXs/a5PA0Y3+A4=
github.com/savsgio/gotils v0.0.0-20230208104028-c358bd845dee/go.mod h1:qwtSXrKuJh/zsFQ12yEE89xfCrGKK63Rr7ctU/uCo4g=
github.com/shopspring/decimal v0.0.0-20180709203117-cd690d0c9e24/go.mod h1:M+9NzErvs504Cn4c5DxATwIqPbtswREoFCre64PpcG4=
github.com/shopspring/decimal v1.2.0 h1:abSATXmQEYyShuxI4/vyW3tV1MrKAJzCZ/0zLUXYbsQ=
github.com/shopspring/decimal v1.2.0/go.mod h1:DKyhrW/HYNuLGql+MJL6WCR6knT2jwCFRcu2hWCYk4o=
github.com/sirupsen/logrus v1.4.1/go.mod h1:ni0Sbl8bgC9z8RoU9G6nDWqqs/fq4eDPysMBDgk/93Q=
github.com/sirupsen/logrus v1.4.2/go.mod h1:tLMulIdttU9McNUspp0xgXVQah82FyeX6MwdIuYE2rE=
github.com/stretchr/objx v0.1.0/go.mod h1:HFkY916IF+rwdDfMAkV7OtwuqBVzrE8GR6GFx+wExME=
github.com/stretchr/objx v0.1.1/go.mod h1:HFkY916IF+rwdDfMAkV7OtwuqBVzrE8GR6GFx+wExME=
github.com/stretchr/objx v0.2.0/go.mod h1:qt09Ya8vawLte6SNmTgCsAVtYtaKzEcn8ATUoHMkEqE=
github.com/stretchr/testify v1.2.2/go.mod h1:a8OnRcib4nhh0OaRAV+Yts87kKdq0PP7pXfy6kDkUVs=
github.com/stretchr/testify v1.3.0/go.mod h1:M5WIy9Dh21IEIfnGCwXGc5bZfKNJtfHm1UVUgZn+9EI=
github.com/stretchr/testify v1.4.0/go.mod h1:j7eGeouHqKxXV5pUuKE4zz7dFj8WfuZ+81PSLYec5m4=
github.com/stretchr/testify v1.5.1/go.mod h1:5W2xD1RspED5o8YsWQXVCued0rvSQ+mT+I5cxcmMvtA=
github.com/stretchr/testify v1.7.0/go.mod h1:6Fq8oRcR53rry900zMqJjRRixrwX3KX962/h/Wwjteg=
github.com/stretchr/testify v1.8.1 h1:w7B6lhMri9wdJUVmEZPGGhZzrYTPvgJArz7wNPgYKsk=
github.com/stretchr/testify v1.8.1/go.mod h1:w2LPCIKwWwSfY2zedu0+kehJoqGctiVI29o6fzry7u4=
github.com/tinylib/msgp v1.1.6/go.mod h1:75BAfg2hauQhs3qedfdDZmWAPcFMAvJE5b9rGOMufyw=
github.com/tinylib/msgp v1.1.8/go.mod h1:qkpG+2ldGg4xRFmx+jfTvZPxfGFhi64BcnL9vkCm/Tw=
github.com/valyala/bytebufferpool v1.0.0 h1:GqA5TC/0021Y/b9FG4Oi9Mr3q7XYx6KllzawFIhcdPw=
github.com/valyala/bytebufferpool v1.0.0/go.mod h1:6bBcMArwyJ5K/AmCkWv1jt77kVWyCJ6HpOuEn7z0Csc=
github.com/valyala/fasthttp v1.47.0/go.mod h1:k2zXd82h/7UZc3VOdJ2WaUqt1uZ/XpXAfE9i+HBC3lA=
github.com/valyala/fasthttp v1.51.0 h1:8b30A5JlZ6C7AS81RsWjYMQmrZG6feChmgAolCl1SqA=
github.com/valyala/fasthttp v1.51.0/go.mod h1:oI2XroL+lI7vdXyYoQk03bXBThfFl2cVdIA3Xl7cH8g=
github.com/valyala/tcplisten v1.0.0 h1:rBHj/Xf+E1tRGZyWIWwJDiRY0zc1Js+CV5DqwacVSA8=
github.com/valyala/tcplisten v1.0.0/go.mod h1:T0xQ8SeCZGxckz9qRXTfG43PvQ/mcWh7FwZEA7Ioqkc=
github.com/yuin/goldmark v1.2.1/go.mod h1:3hX8gzYuyVAZsxl0MRgGTJEmQBFcNTphYh9decYSb74=
github.com/yuin/goldmark v1.4.13/go.mod h1:6yULJ656Px+3vBD8DxQVa3kxgyrAnzto9xy5taEt/CY=
github.com/zenazn/goji v0.9.0/go.mod h1:7S9M489iMyHBNxwZnk9/EHS098H4/F6TATF2mIxtB1Q=
go.uber.org/atomic v1.3.2/go.mod h1:gD2HeocX3+yG+ygLZcrzQJaqmWj9AIm7n08wl/qW/PE=
go.uber.org/atomic v1.4.0/go.mod h1:gD2HeocX3+yG+ygLZcrzQJaqmWj9AIm7n08wl/qW/PE=
go.uber.org/atomic v1.5.0/go.mod h1:sABNBOSYdrvTF6hTgEIbc7YasKWGhgEQZyfxyTvoXHQ=
go.uber.org/atomic v1.6.0/go.mod h1:sABNBOSYdrvTF6hTgEIbc7YasKWGhgEQZyfxyTvoXHQ=
go.uber.org/multierr v1.1.0/go.mod h1:wR5kodmAFQ0UK8QlbwjlSNy0Z68gJhDJUG5sjR94q/0=
go.uber.org/multierr v1.3.0/go.mod h1:VgVr7evmIr6uPjLBxg28wmKNXyqE9akIJ5XnfpiKl+4=
go.uber.org/multierr v1.5.0/go.mod h1:FeouvMocqHpRaaGuG9EjoKcStLC43Zu/fmqdUMPcKYU=
go.uber.org/tools v0.0.0-20190618225709-2cfd321de3ee/go.mod h1:vJERXedbb3MVM5f9Ejo0C68/HhF8uaILCdgjnY+goOA=
go.uber.org/zap v1.9.1/go.mod h1:vwi/ZaCAaUcBkycHslxD9B2zi4UTXhF60s6SWpuDF0Q=
go.uber.org/zap v1.10.0/go.mod h1:vwi/ZaCAaUcBkycHslxD9B2zi4UTXhF60s6SWpuDF0Q=
go.uber.org/zap v1.13.0/go.mod h1:zwrFLgMcdUuIBviXEYEH1YKNaOBnKXsx2IPda5bBwHM=
golang.org/x/crypto v0.0.0-20190308221718-c2843e01d9a2/go.mod h1:djNgcEr1/C05ACkg1iLfiJU5Ep61QUkGW8qpdssI0+w=
golang.org/x/crypto v0.0.0-20190411191339-88737f569e3a/go.mod h1:WFFai1msRO1wXaEeE5yQxYXgSfI8pQAWXbQop6sCtWE=
golang.org/x/crypto v0.0.0-20190510104115-cbcb75029529/go.mod h1:yigFU9vqHzYiE8UmvKecakEJjdnWj3jj499lnFckfCI=
golang.org/x/crypto v0.0.0-20190820162420-60c769a6c586/go.mod h1:yigFU9vqHzYiE8UmvKecakEJjdnWj3jj499lnFckfCI=
golang.org/x/crypto v0.0.0-20191011191535-87dc89f01550/go.mod h1:yigFU9vqHzYiE8UmvKecakEJjdnWj3jj499lnFckfCI=
golang.org/x/crypto v0.0.0-20200622213623-75b288015ac9/go.mod h1:LzIPMQfyMNhhGPhUkYOs5KpL4U8rLKemX1yGLhDgUto=
golang.org/x/crypto v0.0.0-20201203163018-be400aefbc4c/go.mod h1:jdWPYTVW3xRLrWPugEBEK3UY2ZEsg3UU495nc5E+M+I=
golang.org/x/crypto v0.0.0-20210616213533-5ff15b29337e/go.mod h1:GvvjBRRGRdwPK5ydBHafDWAxML/pGHZbMvKqRZ5+Abc=
golang.org/x/crypto v0.0.0-20210711020723-a769d52b0f97/go.mod h1:GvvjBRRGRdwPK5ydBHafDWAxML/pGHZbMvKqRZ5+Abc=
golang.org/x/crypto v0.0.0-20210921155107-089bfa567519/go.mod h1:GvvjBRRGRdwPK5ydBHafDWAxML/pGHZbMvKqRZ5+Abc=
golang.org/x/crypto v0.7.0/go.mod h1:pYwdfH91IfpZVANVyUOhSIPZaFoJGxTFbZhFTx+dXZU=
golang.org/x/crypto v0.43.0 h1:dduJYIi3A3KOfdGOHX8AVZ/jGiyPa3IbBozJ5kNuE04=
golang.org/x/crypto v0.43.0/go.mod h1:BFbav4mRNlXJL4wNeejLpWxB7wMbc79PdRGhWKncxR0=
golang.org/x/lint v0.0.0-20190930215403-16217165b5de/go.mod h1:6SW0HCj/g11FgYtHlgUYUwCkIfeOF89ocIRzGO/8vkc=
golang.org/x/mod v0.0.0-20190513183733-4bf6d317e70e/go.mod h1:mXi4GBBbnImb6dmsKGUJ2LatrhH/nqhxcFungHvyanc=
golang.org/x/mod v0.1.1-0.20191105210325-c90efee705ee/go.mod h1:QqPTAvyqsEbceGzBzNggFXnrqF1CaUcvgkdR5Ot7KZg=
golang.org/x/mod v0.3.0/go.mod h1:s0Qsj1ACt9ePp/hMypM3fl4fZqREWJwdYDEqhRiZZUA=
golang.org/x/mod v0.6.0-dev.0.20220419223038-86c51ed26bb4/go.mod h1:jJ57K6gSWd91VN4djpZkiMVwK6gcyfeH4XE8wZrZaV4=
golang.org/x/mod v0.7.0/go.mod h1:iBbtSCu2XBx23ZKBPSOrRkjjQPZFPuis4dIYUhu/chs=
golang.org/x/mod v0.8.0/go.mod h1:iBbtSCu2XBx23ZKBPSOrRkjjQPZFPuis4dIYUhu/chs=
golang.org/x/net v0.0.0-20190311183353-d8887717615a/go.mod h1:t9HGtf8HONx5eT2rtn7q6eTqICYqUVnKs3thJo3Qplg=
golang.org/x/net v0.0.0-20190404232315-eb5bcb51f2a3/go.mod h1:t9HGtf8HONx5eT2rtn7q6eTqICYqUVnKs3thJo3Qplg=
golang.org/x/net v0.0.0-20190620200207-3b0461eec859/go.mod h1:z5CRVTTTmAJ677TzLLGU+0bjPO0LkuOLi4/5GtJWs/s=
golang.org/x/net v0.0.0-20190813141303-74dc4d7220e7/go.mod h1:z5CRVTTTmAJ677TzLLGU+0bjPO0LkuOLi4/5GtJWs/s=
golang.org/x/net v0.0.0-20201021035429-f5854403a974/go.mod h1:sp8m0HH+o8qH0wwXwYZr8TS3Oi6o0r6Gce1SSxlDquU=
golang.org/x/net v0.0.0-20210226172049-e18ecbb05110/go.mod h1:m0MpNAwzfU5UDzcl9v0D8zg8gWTRqZa9RBIspLL5mdg=
golang.org/x/net v0.0.0-20220722155237-a158d28d115b/go.mod h1:XRhObCWvk6IyKnWLug+ECip1KBveYUHfp+8e9klMJ9c=
golang.org/x/net v0.3.0/go.mod h1:MBQ8lrhLObU/6UmLb4fmbmk5OcyYmqtbGd/9yIeKjEE=
golang.org/x/net v0.6.0/go.mod h1:2Tu9+aMcznHK/AK1HMvgo6xiTLG5rD5rZLDS+rp2Bjs=
golang.org/x/net v0.8.0/go.mod h1:QVkue5JL9kW//ek3r6jTKnTFis1tRmNAW2P1shuFdJc=
golang.org/x/sync v0.0.0-20190423024810-112230192c58/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sync v0.0.0-20201020160332-67f06af15bc9/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sync v0.0.0-20220722155255-886fb9371eb4/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sync v0.1.0/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sys v0.0.0-20180905080454-ebe1bf3edb33/go.mod h1:STP8DvDyc/dI5b8T5hshtkjS+E42TnysNCUPdjciGhY=
golang.org/x/sys v0.0.0-20190215142949-d0b11bdaac8a/go.mod h1:STP8DvDyc/dI5b8T5hshtkjS+E42TnysNCUPdjciGhY=
golang.org/x/sys v0.0.0-20190222072716-a9d3bda3a223/go.mod h1:STP8DvDyc/dI5b8T5hshtkjS+E42TnysNCUPdjciGhY=
golang.org/x/sys v0.0.0-20190403152447-81d4e9dc473e/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20190412213103-97732733099d/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20190422165155-953cdadca894/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20190813064441-fde4db37ae7a/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20191026070338-33540a1f6037/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20200116001909-b77594299b42/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20200223170610-d5e6a3e2c0ae/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20200930185726-fdedc70b468f/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20201119102817-f84b799fce68/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20210615035016-665e8c7367d1/go.mod h1:oPkhp1MJrh7nUepCBck5+mAzfO9JrbApNNgaTdGDITg=
golang.org/x/sys v0.0.0-20220520151302-bc2c85ada10a/go.mod h1:oPkhp1MJrh7nUepCBck5+mAzfO9JrbApNNgaTdGDITg=
golang.org/x/sys v0.0.0-20220722155257-8c9f86f7a55f/go.mod h1:oPkhp1MJrh7nUepCBck5+mAzfO9JrbApNNgaTdGDITg=
golang.org/x/sys v0.0.0-20220811171246-fbc7d0a398ab/go.mod h1:oPkhp1MJrh7nUepCBck5+mAzfO9JrbApNNgaTdGDITg=
golang.org/x/sys v0.3.0/go.mod h1:oPkhp1MJrh7nUepCBck5+mAzfO9JrbApNNgaTdGDITg=
golang.org/x/sys v0.5.0/go.mod h1:oPkhp1MJrh7nUepCBck5+mAzfO9JrbApNNgaTdGDITg=
golang.org/x/sys v0.6.0/go.mod h1:oPkhp1MJrh7nUepCBck5+mAzfO9JrbApNNgaTdGDITg=
golang.org/x/sys v0.8.0/go.mod h1:oPkhp1MJrh7nUepCBck5+mAzfO9JrbApNNgaTdGDITg=
golang.org/x/sys v0.37.0 h1:fdNQudmxPjkdUTPnLn5mdQv7Zwvbvpaxqs831goi9kQ=
golang.org/x/sys v0.37.0/go.mod h1:OgkHotnGiDImocRcuBABYBEXf8A9a87e/uXjp9XT3ks=
golang.org/x/term v0.0.0-20201117132131-f5c789dd3221/go.mod h1:Nr5EML6q2oocZ2LXRh80K7BxOlk5/8JxuGnuhpl+muw=
golang.org/x/term v0.0.0-20201126162022-7de9c90e9dd1/go.mod h1:bj7SfCRtBDWHUb9snDiAeCFNEtKQo2Wmx5Cou7ajbmo=
golang.org/x/term v0.0.0-20210927222741-03fcf44c2211/go.mod h1:jbD1KX2456YbFQfuXm/mYQcufACuNUgVhRMnK/tPxf8=
golang.org/x/term v0.3.0/go.mod h1:q750SLmJuPmVoN1blW3UFBPREJfb1KmY3vwxfr+nFDA=
golang.org/x/term v0.5.0/go.mod h1:jMB1sMXY+tzblOD4FWmEbocvup2/aLOaQEp7JmGp78k=
golang.org/x/term v0.6.0/go.mod h1:m6U89DPEgQRMq3DNkDClhWw02AUbt2daBVO4cn4Hv9U=
golang.org/x/text v0.3.0/go.mod h1:NqM8EUOU14njkJ3fqMW+pc6Ldnwhi/IjpwHt7yyuwOQ=
golang.org/x/text v0.3.2/go.mod h1:bEr9sfX3Q8Zfm5fL9x+3itogRgK3+ptLWKqgva+5dAk=
golang.org/x/text v0.3.3/go.mod h1:5Zoc/QRtKVWzQhOtBMvqHzDpF6irO9z98xDceosuGiQ=
golang.org/x/text v0.3.4/go.mod h1:5Zoc/QRtKVWzQhOtBMvqHzDpF6irO9z98xDceosuGiQ=
golang.org/x/text v0.3.6/go.mod h1:5Zoc/QRtKVWzQhOtBMvqHzDpF6irO9z98xDceosuGiQ=
golang.org/x/text v0.3.7/go.mod h1:u+2+/6zg+i71rQMx5EYifcz6MCKuco9NR6JIITiCfzQ=
golang.org/x/text v0.5.0/go.mod h1:mrYo+phRRbMaCq/xk9113O4dZlRixOauAjOtrjsXDZ8=
golang.org/x/text v0.7.0/go.mod h1:mrYo+phRRbMaCq/xk9113O4dZlRixOauAjOtrjsXDZ8=
golang.org/x/text v0.8.0/go.mod h1:e1OnstbJyHTd6l/uOt8jFFHp6TRDWZR/bV3emEE/zU8=
golang.org/x/text v0.30.0 h1:yznKA/E9zq54KzlzBEAWn1NXSQ8DIp/NYMy88xJjl4k=
golang.org/x/text v0.30.0/go.mod h1:yDdHFIX9t+tORqspjENWgzaCVXgk0yYnYuSZ8UzzBVM=
golang.org/x/tools v0.0.0-20180917221912-90fa682c2a6e/go.mod h1:n7NCudcB/nEzxVGmLbDWY5pfWTLqBcC2KZ6jyYvM4mQ=
golang.org/x/tools v0.0.0-20190311212946-11955173bddd/go.mod h1:LCzVGOaR6xXOjkQ3onu1FJEFr0SW1gC7cKk1uF8kGRs=
golang.org/x/tools v0.0.0-20190425163242-31fd60d6bfdc/go.mod h1:RgjU9mgBXZiqYHBnxXauZ1Gv1EHHAz9KjViQ78xBX0Q=
golang.org/x/tools v0.0.0-20190621195816-6e04913cbbac/go.mod h1:/rFqwRUd4F7ZHNgwSSTFct+R/Kf4OFW1sUzUTQQTgfc=
golang.org/x/tools v0.0.0-20190823170909-c4a336ef6a2f/go.mod h1:b+2E5dAYhXwXZwtnZ6UAqBI28+e2cm9otk0dWdXHAEo=
golang.org/x/tools v0.0.0-20191029041327-9cc4af7d6b2c/go.mod h1:b+2E5dAYhXwXZwtnZ6UAqBI28+e2cm9otk0dWdXHAEo=
golang.org/x/tools v0.0.0-20191029190741-b9c20aec41a5/go.mod h1:b+2E5dAYhXwXZwtnZ6UAqBI28+e2cm9otk0dWdXHAEo=
golang.org/x/tools v0.0.0-20191119224855-298f0cb1881e/go.mod h1:b+2E5dAYhXwXZwtnZ6UAqBI28+e2cm9otk0dWdXHAEo=
golang.org/x/tools v0.0.0-20200103221440-774c71fcf114/go.mod h1:TB2adYChydJhpapKDTa4BR/hXlZSLoq2Wpct/0txZ28=
golang.org/x/tools v0.0.0-20201022035929-9cf592e881e9/go.mod h1:emZCQorbCU4vsT4fOWvOPXz4eW1wZW4PmDk9uLelYpA=
golang.org/x/tools v0.1.12/go.mod h1:hNGJHUnrk76NpqgfD5Aqm5Crs+Hm0VOH/i9J2+nxYbc=
golang.org/x/tools v0.4.0/go.mod h1:UE5sM2OK9E/d67R0ANs2xJizIymRP5gJU295PvKXxjQ=
golang.org/x/tools v0.6.0/go.mod h1:Xwgl3UAJ/d3gWutnCtw505GrjyAbvKui8lOU390QaIU=
golang.org/x/xerrors v0.0.0-20190410155217-1f06c39b4373/go.mod h1:I/5z698sn9Ka8TeJc9MKroUUfqBBauWjQqLJ2OPfmY0=
golang.org/x/xerrors v0.0.0-20190513163551-3ee3066db522/go.mod h1:I/5z698sn9Ka8TeJc9MKroUUfqBBauWjQqLJ2OPfmY0=
golang.org/x/xerrors v0.0.0-20190717185122-a985d3407aa7/go.mod h1:I/5z698sn9Ka8TeJc9MKroUUfqBBauWjQqLJ2OPfmY0=
golang.org/x/xerrors v0.0.0-20191011141410-1b5146add898/go.mod h1:I/5z698sn9Ka8TeJc9MKroUUfqBBauWjQqLJ2OPfmY0=
golang.org/x/xerrors v0.0.0-20200804184101-5ec99f83aff1/go.mod h1:I/5z698sn9Ka8TeJc9MKroUUfqBBauWjQqLJ2OPfmY0=
gopkg.in/check.v1 v0.0.0-20161208181325-20d25e280405/go.mod h1:Co6ibVJAznAaIkqp8huTwlJQCZ016jof/cbN4VW5Yz0=
gopkg.in/check.v1 v1.0.0-20180628173108-788fd7840127/go.mod h1:Co6ibVJAznAaIkqp8huTwlJQCZ016jof/cbN4VW5Yz0=
gopkg.in/errgo.v2 v2.1.0/go.mod h1:hNsd1EY+bozCKY1Ytp96fpM3vjJbqLJn88ws8XvfDNI=
gopkg.in/inconshreveable/log15.v2 v2.0.0-20180818164646-67afb5ed74ec/go.mod h1:aPpfJ7XW+gOuirDoZ8gHhLh3kZ1B08FtV2bbmy7Jv3s=
gopkg.in/yaml.v2 v2.2.2/go.mod h1:hI93XBmqTisBFMUTm0b8Fm+jr3Dg1NNxqwp+5A1VGuI=
gopkg.in/yaml.v3 v3.0.0-20200313102051-9f266ea9e77c/go.mod h1:K4uyk7z7BCEPqu6E+C64Yfv1cQ7kz7rIZviUmN+EgEM=
gopkg.in/yaml.v3 v3.0.1 h1:fxVm/GzAzEWqLHuvctI91KS9hhNmmWOoWu0XTYJS7CA=
gopkg.in/yaml.v3 v3.0.1/go.mod h1:K4uyk7z7BCEPqu6E+C64Yfv1cQ7kz7rIZviUmN+EgEM=
honnef.co/go/tools v0.0.1-2019.2.3/go.mod h1:a3bituU0lyd329TUQxRnasdCoJDkEUEAqEt0JzvZhAg=
\n\n---\n\n
package main

import (
	"log"
	"os"
	"os/signal"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/kolind-am/quran-project/backend/config"
	"github.com/kolind-am/quran-project/backend/database"
	"github.com/kolind-am/quran-project/backend/routes"
)

func main() {
	// Load configuration from environment variables
	cfg := config.Load()

	// Connect to the database
	database.Connect(cfg.DatabaseURL)
	defer database.Close()

	// Create a new Fiber app
	app := fiber.New()

	// Setup CORS
	app.Use(cors.New(cors.Config{
		AllowOrigins: "https://quran.ghars.site, http://localhost:3000",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET,POST,HEAD,PUT,DELETE,PATCH",
	}))

	// Setup routes
	routes.SetupRoutes(app, cfg.JWTSecret)

	// Start the server and implement graceful shutdown
	go func() {
		if err := app.Listen(":" + cfg.ServerPort); err != nil {
			log.Panic(err)
		}
	}()

	// Wait for an interrupt signal to gracefully shut down the server
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	<-c

	log.Println("Gracefully shutting down...")
	_ = app.Shutdown()
}
\n\n---\n\n
package config

import (
	"os"
	"time"
)

// Config holds all configuration for the application.
type Config struct {
	DatabaseURL string
	JWTSecret   string
	ServerPort  string
	JWTExpiry   time.Duration
}

// Load loads configuration from environment variables.
func Load() *Config {
	// Provide default values for critical settings
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		// A default for local development, but should be set in production
		dbURL = "postgres://user:password@localhost:5432/quran_dev"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		// This should absolutely be set in a real environment.
		// Using a hardcoded default is a security risk.
		jwtSecret = "a_very_secret_default_key"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "3002"
	}

	return &Config{
		DatabaseURL: dbURL,
		JWTSecret:   jwtSecret,
		ServerPort:  port,
		JWTExpiry:   72 * time.Hour, // Keep this configurable if needed
	}
}
\n\n---\n\n
package database

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v4/pgxpool"
)

// DB holds the database connection pool.
var DB *pgxpool.Pool

// Connect initializes the database connection pool.
func Connect(databaseURL string) {
	var err error
	// Disable prepared statement caching to avoid issues with connection poolers like pgbouncer
	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		log.Fatalf("Unable to parse database URL: %v\n", err)
	}
	config.ConnConfig.PreferSimpleProtocol = true

	DB, err = pgxpool.ConnectConfig(context.Background(), config)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	fmt.Println("Successfully connected to the database")
}

// Close closes the database connection pool.
func Close() {
	if DB != nil {
		DB.Close()
		fmt.Println("Database connection pool closed.")
	}
}
\n\n---\n\n
package handlers

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"github.com/kolind-am/quran-project/backend/models"
	"github.com/kolind-am/quran-project/backend/repository"
	"golang.org/x/crypto/bcrypt"
)

const (
	bcryptCost = 10
	jwtExpiry  = 72 * time.Hour
)

// AuthHandler holds dependencies for authentication.
type AuthHandler struct {
	userRepo  repository.UserRepository
	jwtSecret string
}

// NewAuthHandler creates a new AuthHandler.
func NewAuthHandler(userRepo repository.UserRepository, jwtSecret string) *AuthHandler {
	return &AuthHandler{userRepo: userRepo, jwtSecret: jwtSecret}
}

// Login handles user authentication.
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req models.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cannot parse JSON"})
	}

	log.Printf("Login attempt for user: %s", req.Username)

	user, err := h.userRepo.FindUserByUsername(c.Context(), req.Username)
	if err != nil {
		log.Printf("User lookup failed for '%s': %v", req.Username, err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid credentials"})
	}
	log.Printf("User '%s' found in database.", req.Username)

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		log.Printf("Password comparison failed for user '%s': %v", req.Username, err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid credentials"})
	}
	log.Printf("Password for user '%s' is correct.", req.Username)

	claims := jwt.MapClaims{
		"id":   user.ID,
		"role": user.Role,
		"exp":  time.Now().Add(jwtExpiry).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	t, err := token.SignedString([]byte(h.jwtSecret))
	if err != nil {
		log.Printf("Token generation failed for user '%s': %v", req.Username, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "could not log in"})
	}
	log.Printf("Token generated successfully for user '%s'.", req.Username)

	return c.JSON(fiber.Map{"token": t})
}
\n\n---\n\n
package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"github.com/kolind-am/quran-project/backend/models"
	"github.com/kolind-am/quran-project/backend/services"
)

// ClassHandler holds the class service.
type ClassHandler struct {
	service services.ClassService
}

// NewClassHandler creates a new ClassHandler.
func NewClassHandler(service services.ClassService) *ClassHandler {
	return &ClassHandler{service: service}
}

// GetClasses handles the request to get all classes.
func (h *ClassHandler) GetClasses(c *fiber.Ctx) error {
	classes, err := h.service.GetClasses(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to get classes"})
	}
	return c.JSON(classes)
}

// GetTeacherClasses handles the request to get a teacher's classes.
func (h *ClassHandler) GetTeacherClasses(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("teacherId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid teacher ID"})
	}
	classes, err := h.service.GetTeacherClasses(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to get teacher classes"})
	}
	return c.JSON(classes)
}

// CreateClass handles the request to create a new class.
func (h *ClassHandler) CreateClass(c *fiber.Ctx) error {
	var class models.Class
	if err := c.BodyParser(&class); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cannot parse JSON"})
	}
	if err := h.service.CreateClass(c.Context(), &class); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create class"})
	}
	return c.Status(fiber.StatusCreated).JSON(class)
}

// UpdateClass handles the request to update a class.
func (h *ClassHandler) UpdateClass(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("classId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid class ID"})
	}
	var class models.Class
	if err := c.BodyParser(&class); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cannot parse JSON"})
	}
	if err := h.service.UpdateClass(c.Context(), id, &class); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update class"})
	}
	return c.JSON(class)
}

// DeleteClass handles the request to delete a class.
func (h *ClassHandler) DeleteClass(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("classId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid class ID"})
	}
	if err := h.service.DeleteClass(c.Context(), id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to delete class"})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

// GetClassStudents handles the request to get students in a class.
func (h *ClassHandler) GetClassStudents(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("classId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid class ID"})
	}
	students, err := h.service.GetClassStudents(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to get class students"})
	}
	return c.JSON(students)
}

// AddClassStudent handles the request to add a student to a class.
func (h *ClassHandler) AddClassStudent(c *fiber.Ctx) error {
	classId, err := strconv.Atoi(c.Params("classId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid class ID"})
	}
	type Request struct {
		StudentID int `json:"student_id"`
	}
	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cannot parse JSON"})
	}

	// Validate student_id
	if req.StudentID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "student_id is required and must be a positive integer"})
	}

	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	teacherId := int(claims["id"].(float64))

	student, err := h.service.AddStudentToClass(c.Context(), classId, req.StudentID, teacherId)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to add student to class"})
	}
	return c.Status(fiber.StatusCreated).JSON(student)
}

// RemoveClassStudent handles the request to remove a student from a class.
func (h *ClassHandler) RemoveClassStudent(c *fiber.Ctx) error {
	classId, err := strconv.Atoi(c.Params("classId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid class ID"})
	}
	studentId, err := strconv.Atoi(c.Params("studentId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid student ID"})
	}
	if err := h.service.RemoveStudentFromClass(c.Context(), classId, studentId); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to remove student from class"})
	}
	return c.SendStatus(fiber.StatusNoContent)
}
\n\n---\n\n
package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/kolind-am/quran-project/backend/models"
	"github.com/kolind-am/quran-project/backend/services"
)

// ProgressHandler holds the progress service.
type ProgressHandler struct {
	service services.ProgressService
}

// NewProgressHandler creates a new ProgressHandler.
func NewProgressHandler(service services.ProgressService) *ProgressHandler {
	return &ProgressHandler{service: service}
}

// GetClassProgress handles the request to get class progress.
func (h *ProgressHandler) GetClassProgress(c *fiber.Ctx) error {
	classId, err := strconv.Atoi(c.Params("classId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid class ID"})
	}
	progress, err := h.service.GetClassProgress(c.Context(), classId)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to get class progress"})
	}
	return c.JSON(progress)
}

// UpdateProgress handles the request to update progress.
func (h *ProgressHandler) UpdateProgress(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("progressId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid progress ID"})
	}
	var progress models.Progress
	if err := c.BodyParser(&progress); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cannot parse JSON"})
	}
	if err := h.service.UpdateProgress(c.Context(), id, &progress); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update progress"})
	}
	return c.JSON(progress)
}
\n\n---\n\n
package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"github.com/kolind-am/quran-project/backend/services"
)

// StudentHandler holds the student service.
type StudentHandler struct {
	service services.StudentService
}

// NewStudentHandler creates a new StudentHandler.
func NewStudentHandler(service services.StudentService) *StudentHandler {
	return &StudentHandler{service: service}
}

// GetMyData handles the request to get the authenticated student's data.
func (h *StudentHandler) GetMyData(c *fiber.Ctx) error {
	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	id := int(claims["id"].(float64))

	studentData, err := h.service.GetStudentData(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to get student data"})
	}
	return c.JSON(studentData)
}
\n\n---\n\n
package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/kolind-am/quran-project/backend/models"
	"github.com/kolind-am/quran-project/backend/services"
)

// UserHandler holds the user service.
type UserHandler struct {
	service services.UserService
}

// NewUserHandler creates a new UserHandler.
func NewUserHandler(service services.UserService) *UserHandler {
	return &UserHandler{service: service}
}

// GetUsers handles the request to get users.
func (h *UserHandler) GetUsers(c *fiber.Ctx) error {
	role := c.Query("role")
	users, err := h.service.GetUsers(c.Context(), role)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to get users"})
	}
	return c.JSON(users)
}

// CreateUser handles the request to create a user.
func (h *UserHandler) CreateUser(c *fiber.Ctx) error {
	var user models.User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cannot parse JSON"})
	}

	if err := h.service.CreateUser(c.Context(), &user); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create user"})
	}

	user.Password = "" // Don't send password back
	return c.Status(fiber.StatusCreated).JSON(user)
}

// UpdateUser handles the request to update a user.
func (h *UserHandler) UpdateUser(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("userId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid user ID"})
	}

	var user models.User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cannot parse JSON"})
	}

	updatedUser, err := h.service.UpdateUser(c.Context(), id, &user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update user"})
	}

	return c.JSON(updatedUser)
}

// DeleteUser handles the request to delete a user.
func (h *UserHandler) DeleteUser(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("userId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid user ID"})
	}

	if err := h.service.DeleteUser(c.Context(), id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to delete user"})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
\n\n---\n\n
package middleware

import (
	"github.com/gofiber/fiber/v2"
	jwtware "github.com/gofiber/jwt/v3"
)

// Protected returns a JWT middleware that protects routes.
func Protected(jwtSecret string) fiber.Handler {
	return jwtware.New(jwtware.Config{
		SigningKey:   []byte(jwtSecret),
		ErrorHandler: jwtError,
	})
}

func jwtError(c *fiber.Ctx, err error) error {
	if err.Error() == "Missing or malformed JWT" {
		return c.Status(fiber.StatusBadRequest).
			JSON(fiber.Map{"status": "error", "message": "Missing or malformed JWT", "data": nil})
	}
	return c.Status(fiber.StatusUnauthorized).
		JSON(fiber.Map{"status": "error", "message": "Invalid or expired JWT", "data": nil})
}
\n\n---\n\n
package models

// User represents a user in the system (teacher, student, or admin).
type User struct {
	ID       int     `json:"id"`
	Username string  `json:"full_name"`
	Password string  `json:"password,omitempty"` // omitempty to prevent sending it in responses
	Role     string  `json:"role"`
	Phone    *string `json:"phone,omitempty"`
}

// StudentWithProgress represents a student with their progress information.
type StudentWithProgress struct {
	ID         int    `json:"id"`
	Username   string `json:"full_name"`
	Role       string `json:"role"`
	ProgressID *int   `json:"progress_id"`
	Surah      *int   `json:"surah"`
	Ayah       *int   `json:"ayah"`
	Page       *int   `json:"page"`
}

// LoginRequest represents the payload for a login request.
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// Class represents a class or a group of students.
type Class struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	TeacherID int    `json:"teacher_id"`
}

// Progress represents a student's progress in a specific class.
type Progress struct {
	ID        int `json:"id"`
	StudentID int `json:"student_id"`
	ClassID   int `json:"class_id"` // Added to associate progress with a class
	Surah     int `json:"surah"`
	Ayah      int `json:"ayah"`
	Page      int `json:"page"`
	UpdatedBy int `json:"updated_by"` // Teacher who updated the progress
}

// StudentData represents the data for a student's dashboard.
type StudentData struct {
	Username      string `json:"username"`
	ProgressSurah int    `json:"progress_surah"`
	ProgressAyah  int    `json:"progress_ayah"`
	ProgressPage  int    `json:"progress_page"`
}
\n\n---\n\n
package repository

import (
	"context"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/kolind-am/quran-project/backend/models"
)

// ClassRepository defines the interface for class data operations.
type ClassRepository interface {
	FindAll(ctx context.Context) ([]models.Class, error)
	FindByTeacherID(ctx context.Context, teacherID int) ([]models.Class, error)
	Create(ctx context.Context, class *models.Class) error
	Update(ctx context.Context, id int, class *models.Class) error
	Delete(ctx context.Context, id int) error
	FindStudentsByClassID(ctx context.Context, classID int) ([]models.StudentWithProgress, error)
	FindStudentByClassAndStudentID(ctx context.Context, classID, studentID int) (*models.StudentWithProgress, error)
	AddStudentToClass(ctx context.Context, classID, studentID int) error
	RemoveStudentFromClass(ctx context.Context, classID, studentID int) error
}

type pgxClassRepository struct {
	db *pgxpool.Pool
}

// NewClassRepository creates a new class repository.
func NewClassRepository(db *pgxpool.Pool) ClassRepository {
	return &pgxClassRepository{db: db}
}

func (r *pgxClassRepository) FindAll(ctx context.Context) ([]models.Class, error) {
	rows, err := r.db.Query(ctx, "SELECT id, name, teacher_id FROM classes")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var classes []models.Class
	for rows.Next() {
		var class models.Class
		if err := rows.Scan(&class.ID, &class.Name, &class.TeacherID); err != nil {
			return nil, err
		}
		classes = append(classes, class)
	}
	return classes, nil
}

func (r *pgxClassRepository) FindByTeacherID(ctx context.Context, teacherID int) ([]models.Class, error) {
	rows, err := r.db.Query(ctx, "SELECT id, name, teacher_id FROM classes WHERE teacher_id=$1", teacherID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var classes []models.Class
	for rows.Next() {
		var class models.Class
		if err := rows.Scan(&class.ID, &class.Name, &class.TeacherID); err != nil {
			return nil, err
		}
		classes = append(classes, class)
	}
	return classes, nil
}

func (r *pgxClassRepository) Create(ctx context.Context, class *models.Class) error {
	_, err := r.db.Exec(ctx, "INSERT INTO classes (name, teacher_id) VALUES ($1, $2)", class.Name, class.TeacherID)
	return err
}

func (r *pgxClassRepository) Update(ctx context.Context, id int, class *models.Class) error {
	_, err := r.db.Exec(ctx, "UPDATE classes SET name=$1 WHERE id=$2", class.Name, id)
	return err
}

func (r *pgxClassRepository) Delete(ctx context.Context, id int) error {
	_, err := r.db.Exec(ctx, "DELETE FROM classes WHERE id=$1", id)
	return err
}

func (r *pgxClassRepository) FindStudentsByClassID(ctx context.Context, classID int) ([]models.StudentWithProgress, error) {
	query := `
        SELECT u.id, u.username, u.role, p.id, p.surah, p.ayah, p.page
        FROM users u
        JOIN class_members cm ON u.id = cm.student_id
        LEFT JOIN progress p ON u.id = p.student_id AND cm.class_id = p.class_id
        WHERE cm.class_id = $1
    `
	rows, err := r.db.Query(ctx, query, classID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var students []models.StudentWithProgress
	for rows.Next() {
		var student models.StudentWithProgress
		if err := rows.Scan(&student.ID, &student.Username, &student.Role, &student.ProgressID, &student.Surah, &student.Ayah, &student.Page); err != nil {
			return nil, err
		}
		students = append(students, student)
	}
	return students, nil
}

func (r *pgxClassRepository) AddStudentToClass(ctx context.Context, classID, studentID int) error {
	_, err := r.db.Exec(ctx, "INSERT INTO class_members (class_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", classID, studentID)
	return err
}

func (r *pgxClassRepository) RemoveStudentFromClass(ctx context.Context, classID, studentID int) error {
	_, err := r.db.Exec(ctx, "DELETE FROM class_members WHERE class_id=$1 AND student_id=$2", classID, studentID)
	return err
}

func (r *pgxClassRepository) FindStudentByClassAndStudentID(ctx context.Context, classID, studentID int) (*models.StudentWithProgress, error) {
	query := `
        SELECT u.id, u.username, u.role, p.id, p.surah, p.ayah, p.page
        FROM users u
        JOIN class_members cm ON u.id = cm.student_id
        LEFT JOIN progress p ON u.id = p.student_id AND cm.class_id = p.class_id
        WHERE cm.class_id = $1 AND u.id = $2
    `
	var student models.StudentWithProgress
	err := r.db.QueryRow(ctx, query, classID, studentID).Scan(&student.ID, &student.Username, &student.Role, &student.ProgressID, &student.Surah, &student.Ayah, &student.Page)
	if err != nil {
		return nil, err
	}
	return &student, nil
}
\n\n---\n\n
package repository

import (
	"context"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/kolind-am/quran-project/backend/models"
)

// ProgressRepository defines the interface for progress data operations.
type ProgressRepository interface {
	FindByClassID(ctx context.Context, classID int) ([]models.Progress, error)
	Update(ctx context.Context, id int, progress *models.Progress) error
	Create(ctx context.Context, progress *models.Progress) (*models.Progress, error)
}

type pgxProgressRepository struct {
	db *pgxpool.Pool
}

// NewProgressRepository creates a new progress repository.
func NewProgressRepository(db *pgxpool.Pool) ProgressRepository {
	return &pgxProgressRepository{db: db}
}

func (r *pgxProgressRepository) FindByClassID(ctx context.Context, classID int) ([]models.Progress, error) {
	rows, err := r.db.Query(ctx, "SELECT id, student_id, surah, ayah, page FROM progress WHERE class_id=$1", classID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var progresses []models.Progress
	for rows.Next() {
		var progress models.Progress
		if err := rows.Scan(&progress.ID, &progress.StudentID, &progress.Surah, &progress.Ayah, &progress.Page); err != nil {
			return nil, err
		}
		progresses = append(progresses, progress)
	}
	return progresses, nil
}

func (r *pgxProgressRepository) Update(ctx context.Context, id int, progress *models.Progress) error {
	_, err := r.db.Exec(ctx, "UPDATE progress SET surah=$1, ayah=$2, page=$3 WHERE id=$4", progress.Surah, progress.Ayah, progress.Page, id)
	return err
}

func (r *pgxProgressRepository) Create(ctx context.Context, progress *models.Progress) (*models.Progress, error) {
	query := `
		INSERT INTO progress (student_id, class_id, surah, ayah, page, updated_by)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, student_id, class_id, surah, ayah, page, updated_by
	`
	createdProgress := &models.Progress{}
	err := r.db.QueryRow(ctx, query, progress.StudentID, progress.ClassID, progress.Surah, progress.Ayah, progress.Page, progress.UpdatedBy).Scan(
		&createdProgress.ID,
		&createdProgress.StudentID,
		&createdProgress.ClassID,
		&createdProgress.Surah,
		&createdProgress.Ayah,
		&createdProgress.Page,
		&createdProgress.UpdatedBy,
	)
	if err != nil {
		return nil, err
	}
	return createdProgress, nil
}
\n\n---\n\n
package repository

import (
	"context"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/kolind-am/quran-project/backend/models"
)

// StudentRepository defines the interface for student data operations.
type StudentRepository interface {
	FindStudentData(ctx context.Context, id int) (*models.StudentData, error)
}

type pgxStudentRepository struct {
	db *pgxpool.Pool
}

// NewStudentRepository creates a new student repository.
func NewStudentRepository(db *pgxpool.Pool) StudentRepository {
	return &pgxStudentRepository{db: db}
}

func (r *pgxStudentRepository) FindStudentData(ctx context.Context, id int) (*models.StudentData, error) {
	var student models.StudentData
	query := `
		SELECT u.username, p.surah, p.ayah, p.page
		FROM users u
		LEFT JOIN progress p ON u.id = p.student_id
		WHERE u.id = $1
		ORDER BY p.id DESC
		LIMIT 1
	`
	err := r.db.QueryRow(ctx, query, id).Scan(&student.Username, &student.ProgressSurah, &student.ProgressAyah, &student.ProgressPage)
	if err != nil {
		return nil, err
	}
	return &student, nil
}
\n\n---\n\n
package repository

import (
	"context"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/kolind-am/quran-project/backend/models"
)

// UserRepository defines the interface for user data operations.
type UserRepository interface {
	FindUsersByRole(ctx context.Context, role string) ([]models.User, error)
	CreateUser(ctx context.Context, user *models.User) error
	UpdateUser(ctx context.Context, id int, user *models.User) (*models.User, error)
	DeleteUser(ctx context.Context, id int) error
	FindUserByUsername(ctx context.Context, username string) (*models.User, error)
}

// pgxUserRepository is an implementation of UserRepository using pgx.
type pgxUserRepository struct {
	db *pgxpool.Pool
}

// NewUserRepository creates a new user repository.
func NewUserRepository(db *pgxpool.Pool) UserRepository {
	return &pgxUserRepository{db: db}
}

// FindUsersByRole retrieves users from the database filtered by role.
func (r *pgxUserRepository) FindUsersByRole(ctx context.Context, role string) ([]models.User, error) {
	rows, err := r.db.Query(ctx, "SELECT id, username, role, phone FROM users WHERE role=$1", role)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		if err := rows.Scan(&user.ID, &user.Username, &user.Role, &user.Phone); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

// CreateUser inserts a new user into the database.
func (r *pgxUserRepository) CreateUser(ctx context.Context, user *models.User) error {
	_, err := r.db.Exec(ctx, "INSERT INTO users (username, password, role, phone) VALUES ($1, $2, $3, $4)", user.Username, user.Password, user.Role, user.Phone)
	return err
}

// UpdateUser updates an existing user in the database.
func (r *pgxUserRepository) UpdateUser(ctx context.Context, id int, user *models.User) (*models.User, error) {
	query := `
		UPDATE users
		SET username=$1, role=$2, phone=$3
		WHERE id=$4
		RETURNING id, username, role, phone
	`
	updatedUser := &models.User{}
	err := r.db.QueryRow(ctx, query, user.Username, user.Role, user.Phone, id).Scan(&updatedUser.ID, &updatedUser.Username, &updatedUser.Role, &updatedUser.Phone)
	if err != nil {
		return nil, err
	}
	return updatedUser, nil
}

// DeleteUser removes a user from the database.
func (r *pgxUserRepository) DeleteUser(ctx context.Context, id int) error {
	_, err := r.db.Exec(ctx, "DELETE FROM users WHERE id=$1", id)
	return err
}

// FindUserByUsername retrieves a single user by their username.
func (r *pgxUserRepository) FindUserByUsername(ctx context.Context, username string) (*models.User, error) {
	var user models.User
	err := r.db.QueryRow(ctx, "SELECT id, username, password, role, phone FROM users WHERE username=$1", username).Scan(&user.ID, &user.Username, &user.Password, &user.Role, &user.Phone)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
\n\n---\n\n
package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/kolind-am/quran-project/backend/database"
	"github.com/kolind-am/quran-project/backend/handlers"
	"github.com/kolind-am/quran-project/backend/middleware"
	"github.com/kolind-am/quran-project/backend/repository"
	"github.com/kolind-am/quran-project/backend/services"
)

// SetupRoutes configures all the application routes.
func SetupRoutes(app *fiber.App, jwtSecret string) {
	app.Use(logger.New())

	// Initialize repositories
	userRepo := repository.NewUserRepository(database.DB)
	classRepo := repository.NewClassRepository(database.DB)
	progressRepo := repository.NewProgressRepository(database.DB)
	studentRepo := repository.NewStudentRepository(database.DB)

	// Initialize services
	userService := services.NewUserService(userRepo)
	classService := services.NewClassService(classRepo, progressRepo)
	progressService := services.NewProgressService(progressRepo)
	studentService := services.NewStudentService(studentRepo)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(userRepo, jwtSecret)
	userHandler := handlers.NewUserHandler(userService)
	classHandler := handlers.NewClassHandler(classService)
	progressHandler := handlers.NewProgressHandler(progressService)
	studentHandler := handlers.NewStudentHandler(studentService)

	// Public routes
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, World!")
	})
	app.Post("/login", authHandler.Login)

	// API group with JWT middleware
	api := app.Group("/api", middleware.Protected(jwtSecret))

	// User Management
	api.Get("/users", userHandler.GetUsers)
	api.Post("/users", userHandler.CreateUser)
	api.Put("/users/:userId", userHandler.UpdateUser)
	api.Delete("/users/:userId", userHandler.DeleteUser)

	// Class Management
	api.Get("/classes", classHandler.GetClasses)
	api.Get("/teachers/:teacherId/classes", classHandler.GetTeacherClasses)
	api.Post("/classes", classHandler.CreateClass)
	api.Put("/classes/:classId", classHandler.UpdateClass)
	api.Delete("/classes/:classId", classHandler.DeleteClass)

	// Class Member Management
	api.Get("/classes/:classId/students", classHandler.GetClassStudents)
	api.Post("/classes/:classId/students", classHandler.AddClassStudent)
	api.Delete("/classes/:classId/students/:studentId", classHandler.RemoveClassStudent)

	// Progress Management
	api.Get("/classes/:classId/progress", progressHandler.GetClassProgress)
	api.Put("/progress/:progressId", progressHandler.UpdateProgress)

	// Student Management
	api.Get("/students/me", studentHandler.GetMyData)
}
\n\n---\n\n
package services

import (
	"context"

	"github.com/kolind-am/quran-project/backend/models"
	"github.com/kolind-am/quran-project/backend/repository"
)

// ClassService defines the interface for class-related business logic.
type ClassService interface {
	GetClasses(ctx context.Context) ([]models.Class, error)
	GetTeacherClasses(ctx context.Context, teacherID int) ([]models.Class, error)
	CreateClass(ctx context.Context, class *models.Class) error
	UpdateClass(ctx context.Context, id int, class *models.Class) error
	DeleteClass(ctx context.Context, id int) error
	GetClassStudents(ctx context.Context, classID int) ([]models.StudentWithProgress, error)
	AddStudentToClass(ctx context.Context, classID, studentID, teacherId int) (*models.StudentWithProgress, error)
	RemoveStudentFromClass(ctx context.Context, classID, studentID int) error
}

type classService struct {
	classRepo    repository.ClassRepository
	progressRepo repository.ProgressRepository // To create progress when adding a student
}

// NewClassService creates a new class service.
func NewClassService(classRepo repository.ClassRepository, progressRepo repository.ProgressRepository) ClassService {
	return &classService{classRepo: classRepo, progressRepo: progressRepo}
}

func (s *classService) GetClasses(ctx context.Context) ([]models.Class, error) {
	return s.classRepo.FindAll(ctx)
}

func (s *classService) GetTeacherClasses(ctx context.Context, teacherID int) ([]models.Class, error) {
	return s.classRepo.FindByTeacherID(ctx, teacherID)
}

func (s *classService) CreateClass(ctx context.Context, class *models.Class) error {
	return s.classRepo.Create(ctx, class)
}

func (s *classService) UpdateClass(ctx context.Context, id int, class *models.Class) error {
	return s.classRepo.Update(ctx, id, class)
}

func (s *classService) DeleteClass(ctx context.Context, id int) error {
	return s.classRepo.Delete(ctx, id)
}

func (s *classService) GetClassStudents(ctx context.Context, classID int) ([]models.StudentWithProgress, error) {
	return s.classRepo.FindStudentsByClassID(ctx, classID)
}

func (s *classService) AddStudentToClass(ctx context.Context, classID, studentID, teacherId int) (*models.StudentWithProgress, error) {
	if err := s.classRepo.AddStudentToClass(ctx, classID, studentID); err != nil {
		return nil, err
	}

	progress := &models.Progress{
		StudentID: studentID,
		ClassID:   classID,
		Surah:     1,
		Ayah:      1,
		Page:      1,
		UpdatedBy: teacherId,
	}
	if _, err := s.progressRepo.Create(ctx, progress); err != nil {
		return nil, err
	}

	return s.classRepo.FindStudentByClassAndStudentID(ctx, classID, studentID)
}

func (s *classService) RemoveStudentFromClass(ctx context.Context, classID, studentID int) error {
	return s.classRepo.RemoveStudentFromClass(ctx, classID, studentID)
}
\n\n---\n\n
package services

import (
	"context"

	"github.com/kolind-am/quran-project/backend/models"
	"github.com/kolind-am/quran-project/backend/repository"
)

// ProgressService defines the interface for progress-related business logic.
type ProgressService interface {
	GetClassProgress(ctx context.Context, classID int) ([]models.Progress, error)
	UpdateProgress(ctx context.Context, id int, progress *models.Progress) error
}

type progressService struct {
	repo repository.ProgressRepository
}

// NewProgressService creates a new progress service.
func NewProgressService(repo repository.ProgressRepository) ProgressService {
	return &progressService{repo: repo}
}

func (s *progressService) GetClassProgress(ctx context.Context, classID int) ([]models.Progress, error) {
	return s.repo.FindByClassID(ctx, classID)
}

func (s *progressService) UpdateProgress(ctx context.Context, id int, progress *models.Progress) error {
	return s.repo.Update(ctx, id, progress)
}
\n\n---\n\n
package services

import (
	"context"

	"github.com/kolind-am/quran-project/backend/models"
	"github.com/kolind-am/quran-project/backend/repository"
)

// StudentService defines the interface for student-related business logic.
type StudentService interface {
	GetStudentData(ctx context.Context, id int) (*models.StudentData, error)
}

type studentService struct {
	repo repository.StudentRepository
}

// NewStudentService creates a new student service.
func NewStudentService(repo repository.StudentRepository) StudentService {
	return &studentService{repo: repo}
}

func (s *studentService) GetStudentData(ctx context.Context, id int) (*models.StudentData, error) {
	return s.repo.FindStudentData(ctx, id)
}
\n\n---\n\n
package services

import (
	"context"

	"github.com/kolind-am/quran-project/backend/models"
	"github.com/kolind-am/quran-project/backend/repository"
	"golang.org/x/crypto/bcrypt"
)

// UserService defines the interface for user-related business logic.
type UserService interface {
	GetUsers(ctx context.Context, role string) ([]models.User, error)
	CreateUser(ctx context.Context, user *models.User) error
	UpdateUser(ctx context.Context, id int, user *models.User) (*models.User, error)
	DeleteUser(ctx context.Context, id int) error
}

// userService is an implementation of UserService.
type userService struct {
	repo repository.UserRepository
}

// NewUserService creates a new user service.
func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

// GetUsers retrieves users, applying any business rules.
func (s *userService) GetUsers(ctx context.Context, role string) ([]models.User, error) {
	// In a real application, you might have more complex logic here,
	// like checking permissions or filtering based on the current user.
	return s.repo.FindUsersByRole(ctx, role)
}

// CreateUser handles the business logic for creating a new user.
func (s *userService) CreateUser(ctx context.Context, user *models.User) error {
	// Hash the password before storing it
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.Password = string(hashedPassword)

	return s.repo.CreateUser(ctx, user)
}

// UpdateUser handles the business logic for updating a user.
func (s *userService) UpdateUser(ctx context.Context, id int, user *models.User) (*models.User, error) {
	// Add any validation or business logic before updating.
	return s.repo.UpdateUser(ctx, id, user)
}

// DeleteUser handles the business logic for deleting a user.
func (s *userService) DeleteUser(ctx context.Context, id int) error {
	// You might want to add checks here, like preventing deletion of the last admin.
	return s.repo.DeleteUser(ctx, id)
}
\n\n---\n\n
