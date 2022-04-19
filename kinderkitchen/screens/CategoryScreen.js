import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  Button,
} from "react-native";

import MyNavMenu from "../nav-bar/MyNavMenu";
import AddCategory from "../Components/AddCategory"; ////MOVed component inside this screen so adding shows update

import {
  getDatabase,
  onValue,
  set,
  get,
  ref,
  child,
  push,
  update,
} from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import CategoryItem from "../Components/CategoryItem";
import { MaterialIcons } from "@expo/vector-icons";
import { setISODay } from "date-fns/esm/fp";
import { render } from "react-dom";

const CategoryScreen = () => {
  //May neeed Asynch calls as page renders twice to wait for data collection

  const database = getDatabase();
  const bdRef = ref(database); //refrences Root database

  const auth = getAuth();
  const [currentUserID, setCurrentUserID] = useState(auth.currentUser.uid);

  const [categoryData, setCategoryData] = useState(); //similar to placeHolderData
  const [placeHolderData, setPlaceHolderData] = useState({
    Fridge: false, //True  ->  Category Has Items
    Pantry: false, //False ->  Category does not have items
    Other: false,
  });

  const [text, setText] = useState("");

  /*  These are for the edit name func */
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [oldCategoryName, setOldCategoryName] = useState("");
  const [itemData, setItemData] = useState([]);

  useEffect(() => {
    ReadCategory();
  }, []);

  /**********************
   *      Functions     *
   **********************/

  function ReadCategory() {
    get(child(ref(database), `users/${currentUserID}/categories`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          setCategoryData(snapshot.val());
        } else {
          console.log("No data available");
          setCategoryData({ UnknownCategory: false });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function displayData() {
    let items = [];
    for (var key in categoryData) {
      items.push(
        <View key={key}>
          <CategoryItem
            categoryName={key}
            deleteCategoryFunction={deleteCategory}
            passingCategoryData={categoryData}
            editCategoryFunction={editCategory}
          />
        </View>
      );
    }
    return items;
  }

  function addCategory(categoryName) {
    if (categoryName === "") {
      alert("Category Name Cannot Be Blank");
      return;
    } //Future Bug - Spaces and extra white space
    if (categoryName in categoryData) {
      alert("Category Already Exists!");
      return;
    } //Future BUG - Case sensitivity, Set to lower/to upper on creation. then do a to upper/tolower comapre
    let localData = categoryData;
    localData[categoryName] = false;
    setCategoryData(localData);
    const updates = {};
    updates["users/" + currentUserID + "/categories/"] = categoryData;
    return update(ref(database), updates);
  }

  function deleteCategory(categoryName) {
    //category name is the Key, Check if False, if False Delete is good
    let hasItems = categoryData[categoryName];
    if (hasItems) {
      alert("Cannot Delete, Category has Items! \nOverride comming soon!");
      return;
    }
    alert("Secondary Confirmation Coming soon!\n Proceeding with Deletion");

    let localData = categoryData;
    delete localData[categoryName];
    /* Once Items Have DB Ref. Remove Category From Items DB Table */
    setCategoryData(localData);
    const updates = {};
    updates["users/" + auth.currentUser.uid + "/categories/"] = categoryData;
    alert(
      "Deletion Success!\nKnown Bug: Page does not update.\n\nLog out and back in to see change."
    );
    return update(ref(database), updates);
  }

  //This Function will Reveal the Modal to edit specified Category
  function editCategory(categoryNameToEdit) {
    setModalVisible(true);
    setOldCategoryName(categoryNameToEdit);
  }

  //DOES the DB Edits
  function onPressSaveEdit() {
    setModalVisible(false); //closing the model

    /*User Input Handling*/
    if (newCategoryName === "") {
      alert("New Category Name Cannot Be Blank");
      return;
    } //Future Bug - Spaces and extra white space
    if (newCategoryName in categoryData) {
      alert("Category Already Exists!");
      return;
    }//Future Bug - CaseSensitive

    let localCategoryData = categoryData;
    const updates = {};

    alert("Changing " + oldCategoryName + " To " + newCategoryName);

    /*Check If Category Has Items*/
    if (categoryData[oldCategoryName]) { //TRUE
      get(child(ref(database), `users/${currentUserID}/items/${oldCategoryName}/`))
        .then((snapshot) => {
          if (snapshot.exists()) {
            setItemData(snapshot.val());
          } else {
            console.log("No data available");
            // ....
          }
        })
        .catch((error) => {
          console.error(error);
        });

      for (var key in itemData) {
        itemData[key].categoryName = newCategoryName;
      }
      updates['users/' + currentUserID + '/items/' + oldCategoryName + '/'] = null; //Remove All DB Items
      //remove(ref(db, `users/${currentUserID}/items/${oldCategoryName}`)); //ALT
      updates['users/' + currentUserID + '/items/' + newCategoryName + '/'] = itemData; //Add Data Back As New Category
      delete localCategoryData[oldCategoryName]; //delete old
      localCategoryData[newCategoryName] = true;//add new
      updates["users/" + currentUserID + "/categories/"] = localCategoryData;

    } else {  //FALSE
      delete localCategoryData[oldCategoryName]; //remove old
      localCategoryData[newCategoryName] = false;//add new
      updates["users/" + currentUserID + "/categories/"] = localCategoryData;
    }

    setCategoryData(localCategoryData);
    setNewCategoryName("");//clearEntry
    return update(ref(database), updates);
  }


  /******************* 
   * Display Content *
   *******************/
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <ScrollView style={styles.scrollView}>
          {/*   Display Categories   */}
          {displayData()}
        </ScrollView>

        {/*   Add Category Field   */}
        <SafeAreaView style={styles.footer}>
          <TextInput
            style={styles.TextInput}
            placeholder="Enter Category Name"
            onChangeText={(text) => setText(text)}
            defaultValue={""}
            placeholderTextColor="#fff"
            underlineColorAndroid="transparent"
          ></TextInput>

          <Button
            onPress={() => {
              addCategory(text);
              setText("");
            }}
            title="Add Category"
            style={styles.button2}
          />
        </SafeAreaView>
      </View>

      {/* Edit Item Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <MaterialIcons
              name="close"
              size={24}
              style={{ ...styles.modalToggle, ...styles.modalClose }}
              onPress={() => setModalVisible(false)}
            />

            <TextInput
              style={styles.textInput}
              placeholder="Enter Category Name"
              onChangeText={(text) => setNewCategoryName(text)}
              defaultValue={""}
              editable={true}
              multiline={false}
              e
              maxLength={200}
            />
            <TouchableOpacity
              onPress={() => onPressSaveEdit()}
              style={styles.touchableSave}
            >
              <Text style={styles.text}> Save </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <MyNavMenu />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  container: {
    backgroundColor: "#E8EAED",
    flex: 1,
    justifyContent: "center",
  },
  scrollView: {
    borderWidth: 1,
    width: "100%",
    marginBottom: 20,
  },
  textInput: {
    width: "30%",
    height: 40,
    backgroundColor: "#fff",
    paddingHorizontal: 30,
    marginBottom: 1,
    borderColor: "black",
    borderWidth: 1,
  },
  touchableSave: {
    backgroundColor: "orange",
    paddingHorizontal: 90,
    alignItems: "center",
    marginTop: 20,
  },
  itm: {
    borderBottomWidth: 1,
    borderBottomColor: "grey",
    alignItems: "flex-start",
  },
  text: {
    marginVertical: 10,
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 2,
    marginRight: 1,
  },

  //MODAL Styles
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  modalToggle: {
    justifyContent: "flex-start",
    alignItems: "stretch",
    marginBottom: 10,
    //borderWidth: 1,
    // borderColor: '#f2f2f2',
    padding: 8,
    top: 1,
    right: 120,
    //borderRadius: 10,
    //alignSelf: 'center',
  },
  modalClose: {
    marginTop: 10,
    marginBottom: 0,
  },

  TextInput: {
    alignSelf: "stretch",
    color: "#fff",
    padding: 10,
    backgroundColor: "#252525",
    borderTopWidth: 2,
    borderTopColor: "#ededed",
  },
  button2: {
    position: "absolute",
    zIndex: 11,
    right: 20,
    bottom: 90,
    backgroundColor: "coral",
    width: 90,
    height: 90,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  addButtonText: {
    backgroundColor: "#2196F3",
  },
});

export default CategoryScreen;
