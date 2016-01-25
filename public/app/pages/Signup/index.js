module.exports = {
  path: 'signup',
  getComponent(location, cb) {
    require.ensure([], (require) => {
      cb(null, require('./Signup'))
    })
  }
}
