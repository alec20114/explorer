
describe('format', function() {

  before(bootstrap.autoAgent)
  before(bootstrap.login)

  it('should get json tree', function(cb) {
    this.request.get('/')
    //this is the default (see index.js)
    // .set('Accept', 'application/json')
    .expect(200)
    .expect('Content-Type', /json/)
    .expect(function(res) {
      expect(res.body).not.to.be.empty
    })
    .end(cb)
  })

  it('should get rss tree', function(cb) {
    this.request.get('/')
    .set('Accept', 'application/rss+xml')
    .expect(200)
    .expect('Content-Type', /rss/)
    // .expect(function(res) {
      //@todo
    // })
    .end(cb)
  })

  it('should get rss tree', function(cb) {
    this.request.get('/search?search=*')
    .set('Accept', 'application/rss+xml')
    .expect(200)
    .expect('Content-Type', /rss/)
    // .expect(function(res) {
      //@todo
    // })
    .end(cb)
  })

  it('should not get rss', function(cb) {
    this.request.get('/settings')
    .set('Accept', 'application/rss+xml')
    .expect(406)
    .end(cb)
  })

  it('should get html tree', function(cb) {
    this.request.get('/')
    .set('Accept', 'text/html')
    .expect(200)
    .expect('Content-Type', /html/)
    .end(cb)
  })

  after(bootstrap.logout)
  after(bootstrap.removeAgent)
})