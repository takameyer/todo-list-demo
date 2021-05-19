import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from './elements/Text';
import {Icon} from './elements/Icon';
import {TodoList} from 'store/TodoListProvider';
import {Touchable} from './elements/Touchable';

interface Props {
  todoList: TodoList;
  setTodoItemListId: (listId: string) => void;
  todoItemListId: string;
}

export const MoveListItem = ({
  todoList,
  todoItemListId,
  setTodoItemListId,
}: Props) => {
  return (
    <View style={styles.container}>
      <Touchable
        onPress={() => {
          setTodoItemListId(todoList.id);
        }}>
        <View style={styles.checkIconContainer}>
          {todoItemListId === todoList.id ? (
            <Icon name="circle" size={26} color={'blue'} />
          ) : (
            <Icon name="circle-thin" size={26} color={'blue'} />
          )}
        </View>
      </Touchable>
      <View style={styles.textContainer}>
        <Text>{todoList.name ?? ''}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  checkIconContainer: {
    padding: 12,
  },
  textContainer: {
    flex: 1,
  },
  editIconContainer: {
    padding: 12,
  },
});
