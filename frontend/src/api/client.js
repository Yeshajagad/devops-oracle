import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
})

export const uploadGithubRepo = (githubUrl) =>
  client.post('/api/upload-repo', { github_url: githubUrl })

export const uploadZip = (file) => {
  const form = new FormData()
  form.append('file', file)
  return client.post('/api/upload-zip', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const sendChat = (question, repoId) =>
  client.post('/api/chat', { question, repo_id: repoId })

export const getRepos = () => client.get('/api/repos')

export const deleteRepo = (repoId) => client.delete(`/api/repo/${repoId}`)

export default client