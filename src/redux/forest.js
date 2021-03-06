import { firebaseInstance, authService, db } from "../lib/firebase";
import axios from "axios";
import { uid } from "uid";
import { whiteURL } from "../lib/constants";

const initialState = {
  treeList: [],
  loading: false,
};

// tree 썸네일에 필요한것: 트리 제목, 트리 썸네일, createdAt. 세가지.

const READ_TREE_LIST_TRY = "forest/READ_TREE_LIST_TRY";
const READ_TREE_LIST_SUCCESS = "forest/READ_TREE_LIST_SUCCESS";
const READ_TREE_LIST_FAIL = "forest/READ_TREE_LIST_FAIL";
export const readTreeList = (userID) => async (dispatch) => {
  dispatch({ type: READ_TREE_LIST_TRY });
  try {
    const user = authService.currentUser;
    if (user) {
      const userRef = await db.collection("users").doc(userID);
      const snapshot = await userRef
        .collection("trees")
        .orderBy("createdAt", "desc")
        .get();
      const treeList = [];
      snapshot.forEach((doc) => {
        treeList.push(doc.data());
      });
      dispatch({ type: READ_TREE_LIST_SUCCESS, treeList });
    }
    //const res = await axios.get(
    //  `${process.env.REACT_APP_BACKEND_URL}/user/${userID}`,
    //  { withCredentials: true }
    //);
  } catch (e) {
    dispatch({ type: READ_TREE_LIST_FAIL, error: e });
  }
};

const CREATE_TREE_TRY = "tree/CREATE_TREE_TRY";
const CREATE_TREE_SUCCESS = "tree/CREATE_TREE_SUCCESS";
const CREATE_TREE_FAIL = "tree/CREATE_TREE_FAIL";
export const createTree = (myID, myNickname) => async (
  dispatch,
  getState,
  { history }
) => {
  dispatch({ type: CREATE_TREE_TRY });
  const uid24 = uid(24);
  try {
    const userRef = await db
      .collection("users")
      .doc(myID)
      .collection("trees")
      .doc(uid24)
      .set({
        title: "New Sprout",
        nodeList: "[]",
        linkList: "[]",
        treeAuthorID: myID,
        treeAuthorNickname: myNickname,
        treeID: uid24,
        thumbnail: whiteURL,
        createdAt: firebaseInstance.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        dispatch({ type: CREATE_TREE_SUCCESS });
        history.push(`/tree/${uid24}`);
      });
  } catch (e) {
    dispatch({ type: CREATE_TREE_FAIL, error: e });
  }
};

const DELETE_TREE_TRY = "forest/DELETE_TREE_TRY";
const DELETE_TREE_SUCCESS = "forest/DELETE_TREE_SUCCESS";
const DELETE_TREE_FAIL = "forest/DELETE_TREE_FAIL";
export const deleteTree = (treeID) => async (dispatch) => {
  const user = authService.currentUser;

  dispatch({ type: DELETE_TREE_TRY });
  try {
    const treeRef = db
      .collection("users")
      .doc(user.uid)
      .collection("trees")
      .doc(treeID)
      .delete();

    dispatch({ type: DELETE_TREE_SUCCESS, treeID });
  } catch (e) {
    dispatch({ type: DELETE_TREE_FAIL, error: e });
  }
};
export default function user(state = initialState, action) {
  switch (action.type) {
    case DELETE_TREE_TRY:
      return { ...state, loading: true };
    case DELETE_TREE_SUCCESS:
      const deletedTreeList = state.treeList.filter((ele) => {
        return ele.treeID !== action.treeID;
      });
      return { ...state, loading: false, treeList: deletedTreeList };
    case DELETE_TREE_FAIL:
      return { ...state, loading: false, error: action.error };
    case READ_TREE_LIST_TRY:
      return { ...state, loading: true, error: null };
    case READ_TREE_LIST_SUCCESS:
      return { ...state, loading: false, treeList: action.treeList };
    case READ_TREE_LIST_FAIL:
      return { ...state, loading: false, error: action.error };
    default:
      return { ...state };
  }
}
