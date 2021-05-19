import React, {useContext, useState, useEffect} from 'react';
import {uuidv4} from 'helpers/uuid';
import {getTimeStamp} from 'helpers/timestamp';
import AsyncStorage from '@react-native-community/async-storage';
import {Alert} from 'react-native';
import {getStoredData, storeData} from 'helpers/storage';
import {pushSyncData, retrieveSyncData} from 'helpers/sync';

type Props = {
  children: React.ReactNode;
};

export type TodoListProviderContext = {
  /**
   * contains all of the todo list data
   */
  store: Store;
  /**
   * adds an item to the given todo list
   *
   * @param listId id of the todo list that the item is being added to
   * @param description short description for the todo item
   */
  addItemToList: (listId: string, description: string) => void;
  /**
   * toggles the done value of an item
   *
   * @param todoId id of the todo item being toggled
   */
  toggleItemFinished: (todoId: string) => void;
  /**
   * updates the todo item's description
   *
   * @param todoId id of the todo item being changed
   * @param description short description for the todo item
   */
  editItemDescription: (todoId: string, description: string) => void;
  /**
   * removes the todo item from the store
   *
   * @param todoId id of the todo item being removed
   */
  removeItem: (todoId: string) => void;
  /**
   * creates a new todo list
   *
   * @param name name of the new list
   */
  createNewList: (name: string) => void;
  /**
   * updates an items todoList id
   *
   * @param todoId  id of the item being moved
   * @param listId  id of the list the item will be moved to
   */
  moveItemToList: (todoId: string, listId: string) => void;
  /**
   *  this forces a synchronization check and updates the store if necessary
   */
  synchronizeData: () => void;
  /**
   * adds a deadline to a todo item
   *
   * @param todoId id of the todo item
   * @param deadline date the item is due
   */
  setItemDeadline: (todoId: string, deadline: Date) => void;
};

/**
 * Class for a todo list.  Initialized with a given name. Automatically gets a uid from the constructor.
 */
export class TodoList {
  id: string;
  name: string;

  constructor(name: string) {
    this.id = uuidv4();
    this.name = name;
  }
}

/**
 * This provides the context of the todoList store
 */
const TodoListsContext = React.createContext<TodoListProviderContext | null>(
  null,
);

/**
 * Class for a todo item.  Initializes given description and listId. Automatically gets a uid from the constructor.
 */
export class Todo {
  id: string;
  description: string;
  listId: string;
  done: boolean;
  deadline?: Date | null;

  constructor(listId: string, description: string) {
    this.id = uuidv4();
    this.description = description;
    this.listId = listId;
    this.done = false;
  }
}

/**
 * This is the initial state of the store when the app is first opened.
 * It is initialized with one empty list so that the user can directly start
 * adding items.
 */
export const initialStore: Store = {
  todoLists: [new TodoList('My Todo List')],
  todoItems: [],
  lastUpdate: 0,
};

/**
 * The store is where all the data is being stored.  Here you can access all
 * the todo list items and lists
 *
 * I have decided to keep the todoLists and todoItems in separate objects.  This keeps the
 * data structure flat and avoids having to move items from one array to the other.
 * todoItems have a listId that can be used to filter on a selected list.
 */
interface Store {
  todoLists: TodoList[];
  todoItems: Todo[];
  lastUpdate: number;
}

// This is used by async storage to persist the store.
const STORAGE_KEY = 'TODO_LISTS';

/**
 * The provider component should wrap the entire app.  This will provide all child components access
 * to the store and its methods.
 *
 * Example:
 * <TodoListProvider>
 *   <App/>
 * </TodoListProvider>
 */
export const TodoListProvider = ({children}: Props) => {
  const [store, setStore] = useState<Store>(initialStore);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    /**
     * this effect will read the locally stored data and also synchronize if there is something there
     */
    const persistStore = async () => {
      //Initialize with local storage
      const savedData = await getStoredData(STORAGE_KEY);
      try {
        if (savedData != null) {
          const json = JSON.parse(savedData);
          if (json.todoLists && json.todoItems && json.lastUpdate) {
            setStore(json);
          }
        }
      } catch (error) {
        console.warn('There was an setting up the data: ', error);
      }
      await synchronizeData();
      setLoading(false);
    };
    persistStore();
  }, []);

  useEffect(() => {
    // Save to local storage
    try {
      storeData(STORAGE_KEY, JSON.stringify(store));
    } catch (error) {
      console.warn('error in saving to async storage', error);
    }

    // Store to sync server
    // do not push sync data if it is the initial data
    if (store.lastUpdate !== 0) {
      pushSyncData(JSON.stringify(store), store.lastUpdate);
    }
  }, [store]);

  function addItemToList(listId: string, description: string) {
    const newTodo = new Todo(listId, description);

    const newStore = {
      ...store,
      todoItems: [...store.todoItems, newTodo],
      lastUpdate: getTimeStamp(),
    };

    setStore(newStore);
  }

  function toggleItemFinished(todoId: string) {
    // We need to make a copy so that the app rerenders on this change
    const storeCopy = {...store};
    const todo = storeCopy.todoItems.find((item) => item.id === todoId);
    if (todo != null) {
      todo.done = !todo.done;
      storeCopy.lastUpdate = getTimeStamp();
      setStore(storeCopy);
    } else {
      Alert.alert('Error: todo item id mismatch on toggle');
    }
  }

  function editItemDescription(todoId: string, description: string) {
    const storeCopy = {...store};
    const todo = storeCopy.todoItems.find((item) => item.id === todoId);
    if (todo != null) {
      todo.description = description;
      storeCopy.lastUpdate = getTimeStamp();
      setStore(storeCopy);
    } else {
      Alert.alert('Error: todo item id mismatch on edit');
    }
  }

  function removeItem(todoId: string) {
    const storeCopy = {...store};
    const todoIndex = store.todoItems.findIndex((item) => item.id === todoId);
    if (todoIndex != -1) {
      storeCopy.todoItems.splice(todoIndex, 1);
      storeCopy.lastUpdate = getTimeStamp();
      setStore(storeCopy);
    } else {
      Alert.alert('Error: todo item id mismatch on remove');
    }
  }

  function createNewList(name: string) {
    const newList = new TodoList(name);

    const newStore = {
      ...store,
      todoLists: [...store.todoLists, newList],
      lastUpdate: getTimeStamp(),
    };

    setStore(newStore);
  }

  function moveItemToList(todoId: string, listId: string) {
    const storeCopy = {...store};
    const todo = store.todoItems.find((item) => item.id === todoId);
    if (todo != null) {
      todo.listId = listId;
      storeCopy.lastUpdate = getTimeStamp();
      setStore(storeCopy);
    } else {
      Alert.alert('Error: todo item id mismatch on move item to list');
    }
  }

  async function synchronizeData() {
    try {
      const syncResult = await retrieveSyncData(store.lastUpdate);
      const data = syncResult?.data ?? '';
      const isNewer = syncResult?.isNewer ?? false;
      // Check if data is set and is newer
      if (data !== '' && isNewer === true) {
        const newStore = JSON.parse(data);
        // quick check that everything is ok
        if (
          newStore.todoLists != null &&
          newStore.todoItems != null &&
          newStore.lastUpdate != null
        ) {
          setStore(newStore);
        } else {
          console.warn('Retrieved sync data was corrupt: ', newStore);
        }
      }
    } catch (error) {
      console.warn(
        'There was in issue communicating with the sync server: ',
        error,
      );
      Promise.reject();
    }
  }

  function setItemDeadline(todoId: string, deadline: Date) {
    const storeCopy = {...store};
    const todo = store.todoItems.find((item) => item.id === todoId);
    if (todo != null) {
      todo.deadline = deadline;
      storeCopy.lastUpdate = getTimeStamp();
      setStore(storeCopy);
    } else {
      Alert.alert('Error: todo item id mismatch on setting deadline');
    }
  }

  if (loading) {
    return null;
  }

  return (
    <TodoListsContext.Provider
      value={{
        store,
        addItemToList,
        toggleItemFinished,
        editItemDescription,
        removeItem,
        createNewList,
        moveItemToList,
        synchronizeData,
        setItemDeadline,
      }}>
      {children}
    </TodoListsContext.Provider>
  );
};

/**
 * hook that provides getters and setters to the todo list store
 *
 * @returns TodoListsContext
 */
export const useTodoLists = () => {
  const context = useContext(TodoListsContext);
  if (context == null) {
    throw new Error('TodoListContext not found!');
  }
  return context;
};
