var express = require('express')
var app = express()

// Set Master Key
Parse.Cloud.useMasterKey()

// Routes
var routes = {
  core: require("cloud/express/routes/index.js"),
  api: require("cloud/express/routes/api.js"),
  workers: require("cloud/express/routes/workers.js"),
  jobs: require("cloud/express/routes/jobs.js"),
  accounts: require("cloud/express/routes/accounts.js")
}

// Global app configuration section
app.set('views', 'cloud/express/views')
app.set('view engine', 'ejs')
app.enable('trust proxy')

// Configure express routes
app.use(express.bodyParser())
app.use(express.cookieParser())
app.use(express.cookieSession({
  secret: 'ursid',
  cookie: {
      httpOnly: true
  }
}))
app.use(function(req, res, next) {
  res.successT = function(data) {
    data = data || {}
    data.success = true
    res.json(data)
  }

  res.errorT = function(error) {
    error = error.description || error

    res.json({
      success: false,
      status: 1,
      message: error
    })
  }

  res.renderT = function(template, data) {
    data = data || {}
    data.host = req.protocol + "://" + req.host
    data.url = data.host + req.url
    data.template = data.template || template
    data.user = data.user || req.session.user
    data.random = Math.random().toString(36).slice(2)
    res.render(template, data)
  }

  next()
})


// Landing
app.get('/', routes.core.auth, routes.workers.home)
app.get('/demo', routes.core.demo)
app.get('/jobs', routes.core.auth, routes.jobs.home)
app.get('/account', routes.core.auth, routes.accounts.home)
app.get('/logout', routes.core.logout)
app.post('/login', routes.core.login)

// Google Docs
app.get('/pitch', routes.core.pitch)
app.get('/slide', routes.core.slide)

//Accounts
app.post('/account', routes.core.auth, routes.accounts.user)
app.post('/account/company', routes.core.auth, routes.accounts.company)

// Jobs
app.get('/job/:job/cancel', routes.core.auth, routes.jobs.cancel)
app.post('/jobs/simulate', routes.core.auth, routes.jobs.simulate)

// Workers
app.get('/worker/:user/invite', routes.core.auth, routes.workers.invited)
app.get('/worker/:user/accept', routes.core.auth, routes.workers.accepted)
app.get('/worker/:user/decline', routes.core.auth, routes.workers.declined)
app.get('/worker/:user/drop', routes.core.auth, routes.workers.dropped)

// API
app.get('/api/workers', routes.api.auth, routes.api.get.workers)
app.get('/api/workers/pending', routes.api.auth, routes.api.get.pendingWorkers)
app.get('/api/:job/status', routes.api.auth, routes.api.get.jobStatus)
app.post('/api/job', routes.api.auth, routes.api.post.jobs)
app.post('/api/:job/cancel', routes.api.auth, routes.api.post.cancel)
app.post('/api/:worker/pending', routes.api.auth, routes.api.post.pending)

// Not Found Redirect
app.all("*", routes.core.notfound)

// Listen to Parse
app.listen()
