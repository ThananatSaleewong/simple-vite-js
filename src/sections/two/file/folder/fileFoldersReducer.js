import * as types from "./fileFoldersActionTypes"


const initiakState = {
  isLoading: false,
  currentFolder: "root",
  userFolders: [],
  userFiles: [],
  adminFolders: [],
  adminFiles: [],
}

const fileFoldersReducer = (state = initiakState, action) => {
  switch (action.type) {
    case types.CREATE_FOLDER:
      return{
        ...state,
        userFolders: [...state.userFolders, action.payload]
      }
    default: return state;
  }
} 
export default fileFoldersReducer;