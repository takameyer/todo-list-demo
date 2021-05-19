import React from 'react';
import {View, Text, FlatList} from 'react-native';
import {useTodoLists, Todo} from 'store/TodoListProvider';
import {TodoItem} from './TodoItem';
import {useSelectedList} from 'store/SelectedListProvider';

export const TodoList = () => {
  const {selectedList} = useSelectedList();
  const {store} = useTodoLists();

  return (
    <FlatList<Todo>
      data={store.todoItems.filter(
        (todoItem) => todoItem.listId === selectedList,
      )}
      renderItem={({item}) => {
        return <TodoItem todoItem={item} />;
      }}
      keyExtractor={(item) => item.id}
    />
  );
};
