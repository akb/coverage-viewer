package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path"
	"regexp"

	"github.com/google/go-github/github"
)

type infoResponse struct {
	Owner string   `json:"owner"`
	Name  string   `json:"name"`
	Stars int      `json:"stars"`
	Files []string `json:"files"`
}

type fileResponse struct {
	Path    string `json:"path"`
	Content string `json:"content"`
}

var (
	infoPattern = regexp.MustCompile(`/api/([^/]+)/([^/]+)/info`)
	filePattern = regexp.MustCompile(`/api/([^/]+)/([^/]+)/info/([^?]+)`)
	testPattern = regexp.MustCompile(`/api/([^/]+)/([^/]+)/test`)
)

var gh *github.Client

func init() {
	gh = github.NewClient(nil)
}

func api(w http.ResponseWriter, r *http.Request) {
	fileMatch := filePattern.FindStringSubmatch(r.URL.String())
	infoMatch := infoPattern.FindStringSubmatch(r.URL.String())
	testMatch := testPattern.FindStringSubmatch(r.URL.String())

	if r.Method == http.MethodGet {
		if len(fileMatch) > 0 {
			file(w, r, fileMatch[1], fileMatch[2], fileMatch[3])
			return
		} else if len(infoMatch) > 0 {
			info(w, r, infoMatch[1], infoMatch[2])
			return
		}
	} else if r.Method == http.MethodPost {
		if len(testMatch) > 0 {
			test(w, r, testMatch[1], testMatch[2])
			return
		}
	}
	http.NotFound(w, r)
}

func apiError(w http.ResponseWriter, r *github.Response, err error) {
	var message string
	var statusCode int
	if r.StatusCode == 403 {
		message = fmt.Sprintf("github api rate limit exceeded\n%s\n", err)
		statusCode = 403
	} else if r.StatusCode == 404 {
		message = fmt.Sprintf("repository not found\n%s\n", err)
		statusCode = 404
	} else {
		message = fmt.Sprintf("github api error\n%s\n", err)
		statusCode = 500
	}
	log.Print(message)
	http.Error(w, message, statusCode)
}

func info(w http.ResponseWriter, r *http.Request, owner, repo string) {
	repository, response, err := gh.Repositories.Get(r.Context(), owner, repo)
	if err != nil {
		apiError(w, response, err)
		return
	}

	_, contents, response, err := gh.Repositories.GetContents(
		r.Context(), owner, repo, "/", nil)
	if err != nil {
		apiError(w, response, err)
		return
	}

	var files []string
	for _, file := range contents {
		if file.GetType() == "file" {
			files = append(files, file.GetPath())
		}
	}

	bytes, err := json.Marshal(
		infoResponse{owner, repo, repository.GetStargazersCount(), files})
	if err != nil {
		http.Error(w, fmt.Sprintf("error marshaling json:\n%s\n", err), 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(bytes)
}

func file(w http.ResponseWriter, r *http.Request, owner, repo, path string) {
	contents, _, response, err := gh.Repositories.GetContents(r.Context(),
		owner, repo, path, nil)
	if err != nil {
		apiError(w, response, err)
		return
	}

	content, err := contents.GetContent()
	if err != nil {
		apiError(w, response, err)
		return
	}

	bytes, err := json.Marshal(fileResponse{path, content})
	if err != nil {
		http.Error(w, fmt.Sprintf("error marshaling json:\n%s\n", err), 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(bytes)
}

func test(w http.ResponseWriter, r *http.Request, owner, repo string) {
	dir, err := ioutil.TempDir("", "coview-")
	if err != nil {
		message := fmt.Sprintf("error creating temporary directory\n%s\n", err)
		log.Print(message)
		http.Error(w, message, 500)
		return
	}
	defer os.RemoveAll(dir)

	repoDir := path.Join(dir, repo)
	url := fmt.Sprintf("git@github.com:%s/%s.git", owner, repo)
	clone := exec.CommandContext(r.Context(), "git", "clone", url, repoDir)

	gitOutput, err := clone.CombinedOutput()
	if err != nil {
		message := fmt.Sprintf("error cloning repo\n%s\n%s\n", err, gitOutput)
		log.Print(message)
		http.Error(w, message, 500)
		return
	}

	coverage := exec.CommandContext(r.Context(),
		"go", "test", "-coverprofile=coverage.out")
	coverage.Dir = repoDir

	output, err := coverage.CombinedOutput()
	if err != nil {
		message := fmt.Sprintf("error generating coverage\n%s\n%s\n", err, output)
		log.Print(message)
		http.Error(w, message, 500)
		return
	}

	coverageBytes, err := ioutil.ReadFile(path.Join(repoDir, "coverage.out"))
	if err != nil {
		message := fmt.Sprintf("error reading coverage file:\n%s\n", err)
		log.Print(message)
		http.Error(w, message, 500)
		return
	}

	parsedCoverage := ParseCover(coverageBytes)

	jsonBytes, err := json.Marshal(parsedCoverage)
	if err != nil {
		message := fmt.Sprintf("error marshaling json:\n%s\n", err)
		log.Print(message)
		http.Error(w, message, 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonBytes)
}
