// Storage Controller
const StorageController = (function() {

  return {
    storeItem: function(item) {
      let items = this.getItemsFromStorage();
      items.push(item);
      localStorage.setItem('items', JSON.stringify(items));
    },

    getItemsFromStorage: function() {
      let items = localStorage.getItem('items');
      if(!items) return [];
      else return JSON.parse(items);
    },

    updateItemInStorage: function(updatedItem) {
      let items = this.getItemsFromStorage();
      items.forEach((item,index) => {
        if(item.id === updatedItem.id) {
          items.splice(index, 1, updatedItem);
        }
      });
      localStorage.setItem('items', JSON.stringify(items));
    },

    deleteItemFromStorage: function(updatedItem) {
      let items = this.getItemsFromStorage();
      items.forEach((item,index) => {
        if(item.id === updatedItem.id) {
          items.splice(index, 1);
        }
      });
      localStorage.setItem('items', JSON.stringify(items));
    },

    clearStorage: function() {
      localStorage.removeItem('items');
    }
  }
}());

// Item Controller
const ItemController = (function() {
  // Item Constructor
  const Item = function(id, name, calories) {
    this.id = id;
    this.name = name;
    this.calories = calories;
  };

  let id = 3;

  // Data structure / State
  const data = {
    items: StorageController.getItemsFromStorage(),
    currentItem: null,
    totalCalories: 0
  };

  return {
    getItems: function() {
      return data.items;
    },

    addItem: function(name, calories) {
      let id;
      let items = data.items;
      if(!items.length) id=1;
      else {
        id = items[items.length-1].id + 1;
      }
      const newItem = new Item(id, name,calories);
      data.items.push(newItem);
      return newItem;
    },

    getTotalCalories: function() {
      data.totalCalories =  data.items.reduce((acc,item)=>acc+=item.calories, 0);
      return data.totalCalories;
    },

    setCurrentItemById: function(id) {
      data.currentItem = data.items.find(item=>item.id===id);
    },

    getCurrentItemData: function() {
      return data.currentItem;
    },

    updateItem: function(name, calories) {
      const currentId = data.currentItem.id;
      data.items.forEach(function(item){
        if(item.id === currentId) {
          item.name = name;
          item.calories = calories;
          found = item;
        }
      });
      return found;
    },

    deleteItem: function() {
      const currentId = data.currentItem.id;
      const updatedItems = data.items.filter(item=>item.id!==currentId);
      data.items = updatedItems;
    },

    clearAll: function() {
      data.items = [],
      data.currentItem = null,
      data.totalCalories = 0
    }
  };
})();

// UI Controller
const UIController = (function() {
  const uiElements = {
    itemList: document.querySelector('#item-list'),
    addButton: document.querySelector('.add-btn'),
    updateButton: document.querySelector('.update-btn'),
    deleteButton: document.querySelector('.delete-btn'),
    backButton: document.querySelector('.back-btn'),
    clearButton: document.querySelector('.clear-btn'),
    nameInput: document.querySelector('#item-name'),
    calorieInput: document.querySelector('#item-calories'),
    totalCalories: document.querySelector('.total-calories')
  };

  const itemMarkup = function(item) {
    return `
      <li class="collection-item" id="item-${item.id}">
        <strong>${item.name}: </strong> <em>${item.calories} Calories</em>
        <a class="secondary-content"><i class="edit-item fa fa-pencil"></i></a>
      </li>
    `;
  };

  return {
    populateItems: function(items) {
      let html = '';
      items.forEach(function(item) {
        html += itemMarkup(item);
      });

      uiElements.itemList.innerHTML = html;
    },

    getUiElements: function() {
      return uiElements;
    },

    getItemInput: function() {
      return {
        name: uiElements.nameInput.value,
        calories: parseInt(uiElements.calorieInput.value)
      }
    },

    addListItem: function(item) {
      let li = document.createElement('li');
      li.className = 'collection-item';
      li.id = `item-${item.id}`;
      li.innerHTML = `
        <strong>${item.name}: </strong> <em>${item.calories} Calories</em>
        <a class="secondary-content"><i class="edit-item fa fa-pencil"></i></a>
      `;
      uiElements.itemList.appendChild(li);
      uiElements.itemList.style.display = 'block';
    },

    clearInputFields: function() {
      uiElements.nameInput.value = '';
      uiElements.calorieInput.value = '';
    },

    hideList: function() {
      uiElements.itemList.style.display = 'none';
    },

    showTotalCalories: function(totalCalories) {
      uiElements.totalCalories.textContent = totalCalories;
    },

    clearEditState: function() {
      UIController.clearInputFields();
      uiElements.updateButton.style.display = 'none';
      uiElements.deleteButton.style.display = 'none';
      uiElements.backButton.style.display = 'none';
      uiElements.addButton.style.display = 'inline-block';
      return false;
    },

    showEditState: function() {
      uiElements.updateButton.style.display = 'inline-block';
      uiElements.deleteButton.style.display = 'inline-block';
      uiElements.backButton.style.display = 'inline-block';
      uiElements.addButton.style.display = 'none';
    },

    addItemToForm: function() {
      const currentItem = ItemController.getCurrentItemData();
      uiElements.nameInput.value = currentItem.name;
      uiElements.calorieInput.value = currentItem.calories;
    },

    updateListItem: function(updatedItem) {
      let listItems = Array.from(document.querySelectorAll('#item-list li'));
      listItems.forEach(listItem => {
        const itemId = listItem.id;
        if(itemId === `item-${updatedItem.id}`) {
          listItem.innerHTML = `
            <strong>${updatedItem.name}: </strong> <em>${updatedItem.calories} Calories</em>
            <a class="secondary-content"><i class="edit-item fa fa-pencil"></i></a>
          `;
        }
      });
    },

    deleteListItem: function() {
      const currentItemId = ItemController.getCurrentItemData().id;
      const listItem = document.querySelector(`#item-${currentItemId}`);
      listItem.remove();
    },

    clearAllListItems: function() {
      let listItems = Array.from(document.querySelectorAll('#item-list li'));
      listItems.forEach(listItem=>listItem.remove());
    }
  }
})();

// App Controller
const App = (function(ItemController, UIController, StorageController) {
  const loadEventListeners = function() {
    const uiElements = UIController.getUiElements();
    uiElements.addButton.addEventListener('click', onItemAdd);
    uiElements.itemList.addEventListener('click', onItemEdit);
    uiElements.updateButton.addEventListener('click', onItemUpdate);
    uiElements.backButton.addEventListener('click', UIController.clearEditState);
    uiElements.deleteButton.addEventListener('click', onItemDelete);
    uiElements.clearButton.addEventListener('click', onClearAll);
    document.addEventListener('keypress', function(e) {
      if(e.keycode === 13 || e.which === 13) {
        e.preventDefault();
        return false;
      }
    })
  };

  const onItemAdd = function(e) {
    e.preventDefault();
    const input = UIController.getItemInput();
    if(!input.name.trim().length || !input.calories) return;
    const newItem = ItemController.addItem(input.name, input.calories);
    UIController.addListItem(newItem);
    StorageController.storeItem(newItem);
    const totalCalories = ItemController.getTotalCalories();
    UIController.showTotalCalories(totalCalories);
    UIController.clearInputFields();
  };

  const onItemEdit = function(e) {
    e.preventDefault();
    if(e.target.classList.contains('edit-item')) {
      const listId = e.target.parentNode.parentNode.id;
      const id = parseInt(listId.split('-')[1]);
      ItemController.setCurrentItemById(id);
      UIController.addItemToForm();
      UIController.showEditState();
    }
  };

  const onItemDelete = function(e) {
    e.preventDefault();
    ItemController.deleteItem();
    UIController.deleteListItem();
    StorageController.deleteItemFromStorage(ItemController.getCurrentItemData());
    const totalCalories = ItemController.getTotalCalories();
    UIController.showTotalCalories(totalCalories);
    UIController.clearEditState();
  };

  const onItemUpdate = function(e) {
    const input = UIController.getItemInput();
    const updatedItem = ItemController.updateItem(input.name, input.calories);
    UIController.updateListItem(updatedItem);
    StorageController.updateItemInStorage(updatedItem);
    const totalCalories = ItemController.getTotalCalories();
    UIController.showTotalCalories(totalCalories);
    UIController.clearEditState();
    e.preventDefault();
  };

  const onClearAll = function(e) {
    e.preventDefault();
    ItemController.clearAll();
    UIController.clearAllListItems();
    UIController.showTotalCalories(0);
    StorageController.clearStorage();
  };

  // Public Methods
  return {
    init: function() {
      UIController.clearEditState();
      loadEventListeners();
      const items = ItemController.getItems();
      (!items.length) && UIController.hideList();
      UIController.populateItems(items);
      const totalCalories = ItemController.getTotalCalories();
      UIController.showTotalCalories(totalCalories);
    }
  };
})(ItemController, UIController, StorageController);

App.init();
