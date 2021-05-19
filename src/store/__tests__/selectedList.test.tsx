import React from 'react';
import {
  useSelectedList,
  SelectedListProviderContext,
  SelectedListProvider,
} from 'store/SelectedListProvider';
import {act, create} from 'react-test-renderer';
import {
  TodoListProvider,
  TodoListProviderContext,
  useTodoLists,
} from 'store/TodoListProvider';

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

// This test creates a test component that will perform actions on the useSelectedList hook

async function setup(): Promise<{
  selectedListContext: SelectedListProviderContext;
  todoListContext: TodoListProviderContext;
}> {
  //@ts-ignore need to initialize as empty object
  const selectedListContext: SelectedListProviderContext = {};
  //@ts-ignore need to initialize as empty object
  const todoListContext: TodoListProviderContext = {};
  function FakeComponent() {
    Object.assign(selectedListContext, useSelectedList());
    Object.assign(todoListContext, useTodoLists());
    return null;
  }

  await act(async () => {
    create(
      <TodoListProvider>
        <SelectedListProvider>
          <FakeComponent />
        </SelectedListProvider>
      </TodoListProvider>,
    );
  });

  return {selectedListContext, todoListContext};
}

describe('SelectedListProvider', () => {
  let selectedListContext: SelectedListProviderContext | null = null;
  let todoListContext: TodoListProviderContext | null = null;

  beforeEach(async () => {
    const result = await setup();
    selectedListContext = result.selectedListContext;
    todoListContext = result.todoListContext;
  });

  it('sets and updates the selected list', () => {
    act(() => selectedListContext?.setSelectedList('123'));
    expect(selectedListContext?.selectedList).toBe('123');
  });

  it('is initialized with the id of the first list', () => {
    const firstListId = todoListContext?.store?.todoLists[0].id;
    expect(selectedListContext?.selectedList).toBe(firstListId);
  });
});
