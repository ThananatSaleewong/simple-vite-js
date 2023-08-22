
const store = createStore(
  rootReuducer,
  composeWithDevTools(applyMiddleware(thunk))
)
export default store