import React from 'react';
import {
  TodoListProvider,
  useTodoLists,
  initialStore,
  TodoListProviderContext,
} from 'store/TodoListProvider';
import {act, create} from 'react-test-renderer';

jest.mock('helpers/storage', () => {
  return {
    getStoredData: jest.fn(() => Promise.resolve(null)),
    storeData: jest.fn(() => Promise.resolve()),
  };
});

jest.mock('helpers/sync', () => {
  return {
    retrieveSyncData: jest.fn(() =>
      Promise.resolve({
        data: '',
        isNewer: false,
      }),
    ),
    pushSyncData: jest.fn(() => Promise.resolve()),
  };
});

// This test creates a test component that will perform actions on the useTodoLists hook
// That way we can test all the core functionality of the app

async function setup() {
  //@ts-ignore need to initialize as empty object
  const context: TodoListProviderContext = {};
  function FakeComponent() {
    Object.assign(context, useTodoLists());
    return null;
  }

  // The following is a bit of syntax magic to get "setLoading" to not throw
  // an error when initializing the provider.
  await act(async () => {
    create(
      <TodoListProvider>
        <FakeComponent />
      </TodoListProvider>,
    );
  });

  return context;
}

describe('TodoListProvider', () => {
  let storeContext: TodoListProviderContext | null = null;

  beforeEach(async () => {
    storeContext = await setup();
  });

  it('can add items to the todo list', () => {
    expect(storeContext?.store).toBe(initialStore);
    const listId = storeContext?.store.todoLists[0].id ?? '';
    act(() => storeContext?.addItemToList(listId, 'test'));
    expect(storeContext?.store.todoItems[0].description).toBe('test');
    act(() => storeContext?.addItemToList(listId, 'test2'));
    expect(storeContext?.store.todoItems[1].description).toBe('test2');
  });

  it('can mark items on the list as finished', () => {
    expect(storeContext?.store).toBe(initialStore);
    const listId = storeContext?.store.todoLists[0].id ?? '';
    act(() => storeContext?.addItemToList(listId, 'test'));
    expect(storeContext?.store.todoItems[0].description).toBe('test');
    expect(storeContext?.store.todoItems[0].done).toBe(false);
    const id = storeContext?.store.todoItems[0].id ?? '';
    act(() => storeContext?.toggleItemFinished(id));
    expect(storeContext?.store.todoItems[0].done).toBe(true);
  });

  it('can edit an items description', () => {
    expect(storeContext?.store).toBe(initialStore);
    const listId = storeContext?.store.todoLists[0].id ?? '';
    act(() => storeContext?.addItemToList(listId, 'test'));
    expect(storeContext?.store.todoItems[0].description).toBe('test');
    const id = storeContext?.store.todoItems[0].id ?? '';
    act(() => storeContext?.editItemDescription(id, 'changed description'));
    expect(storeContext?.store.todoItems[0].description).toBe(
      'changed description',
    );
  });

  it('can delete an items', () => {
    expect(storeContext?.store).toBe(initialStore);
    const listId = storeContext?.store.todoLists[0].id ?? '';
    act(() => storeContext?.addItemToList(listId, 'test'));
    expect(storeContext?.store.todoItems[0].description).toBe('test');
    act(() => storeContext?.addItemToList(listId, 'test2'));
    expect(storeContext?.store.todoItems[1].description).toBe('test2');
    const id = storeContext?.store.todoItems[0].id ?? '';
    act(() => storeContext?.removeItem(id));
    expect(storeContext?.store.todoItems[1]).not.toBeDefined();
  });

  it('can create a new list', () => {
    expect(storeContext?.store).toBe(initialStore);
    act(() => storeContext?.createNewList('new List'));
    expect(storeContext?.store.todoLists[1].name).toBe('new List');
  });

  it('can move an item from one list to the other', () => {
    expect(storeContext?.store).toBe(initialStore);

    const originalListId = storeContext?.store.todoLists[0].id ?? '';

    act(() => storeContext?.addItemToList(originalListId, 'test'));
    expect(storeContext?.store.todoItems[0].description).toBe('test');

    act(() => storeContext?.addItemToList(originalListId, 'test2'));
    expect(storeContext?.store.todoItems[1].description).toBe('test2');

    const todoId = storeContext?.store.todoItems[0].id ?? '';

    act(() => storeContext?.createNewList('new List'));
    expect(storeContext?.store.todoLists[1].name).toBe('new List');

    const otherListId = storeContext?.store.todoLists[1].id ?? '';

    expect(storeContext?.store.todoItems[0].listId).toBe(originalListId);
    act(() => storeContext?.moveItemToList(todoId, otherListId));
    expect(storeContext?.store.todoItems[0].listId).toBe(otherListId);
  });
  it('can set a deadline', () => {
    expect(storeContext?.store).toBe(initialStore);
    const listId = storeContext?.store.todoLists[0].id ?? '';
    act(() => storeContext?.addItemToList(listId, 'test'));
    const todoId = storeContext?.store.todoItems[0].id ?? '';
    const deadline = new Date();
    act(() => storeContext?.setItemDeadline(todoId, deadline));
    expect(storeContext?.store.todoItems[0].deadline).toBe(deadline);
  });
});
