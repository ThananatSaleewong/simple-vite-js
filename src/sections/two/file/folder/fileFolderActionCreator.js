import * as types from "./fileFoldersActionTypes"

const addFolder = (payload) => ({
  type: types.CREATE_FOLDER,
  payload

})

export const createFolder = (folderName) => (dispatch) => {
  console.log(folderName)
}