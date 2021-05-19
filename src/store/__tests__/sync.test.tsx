import React from 'react';
import {
  TodoListProvider,
  useTodoLists,
  initialStore,
  TodoListProviderContext,
} from 'store/TodoListProvider';
import {act, create} from 'react-test-renderer';

/**
 * I have made a copy of the todolist test strictly for synchronization testing.
 * Adhoc mocking the retrieveSyncData method was not working.  Time permitting
 * I would try and solve this issue and have the two test combined.
 */

jest.mock('helpers/storage', () => {
  return {
    getStoredData: jest.fn(() => Promise.resolve(null)),
    storeData: jest.fn(() => Promise.resolve()),
  };
});

jest.mock('helpers/sync', () => {
  return {
    retrieveSyncData: jest.fn(() => {
      return Promise.resolve({
        data: JSON.stringify({
          todoLists: [{id: '123', name: 'My Todo List Synced'}],
          todoItems: [{id: '321', description: 'sync todo list', done: true}],
          lastUpdate: 654321,
        }),
        isNewer: true,
      });
    }),
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

  it('updates the data if something newer comes from the sync server', async () => {
    let syncResult: any = {
      todoLists: [{id: '123', name: 'My Todo List Synced'}],
      todoItems: [{id: '321', description: 'sync todo list', done: true}],
      lastUpdate: 654321,
    };

    await act(async () => storeContext?.synchronizeData());
    expect(storeContext?.store).toStrictEqual(syncResult);
  });
});
