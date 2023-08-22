import fileFoldersReducer from "./fileFoldersReducer"





const rootReuducer = combineReducers({
   auth: authReducer, 
   filefolders: fileFoldersReducer})
   export default rootReuducer