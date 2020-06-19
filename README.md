# System Dependencies

To build coverage-viewer, `node` and `npm` must be installed and available on
the system path.

To run coverage-viewer, `go` and `git` must be installed and available on the
system path.

# Building the Frontend

    cd frontend
    npm install
    npm run build-and-install

# Installing Go dependencies

    go get ./...

# Running the application server

    go run main.go api.go parse_cover.go
