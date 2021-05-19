import React, {useState} from 'react';
import {TodoList, useTodoLists} from 'store/TodoListProvider';
import {FlatList, Alert, Keyboard} from 'react-native';
import {ModalBody} from './elements/ModalBody';
import {ListItem} from './ListItem';
import {Text} from './elements/Text';
import {TextInput} from './elements/TextInput';
import {Touchable} from './elements/Touchable';
import {Icon} from './elements/Icon';

interface Props {
  setModalVisible: (visible: boolean) => void;
}

export const ListConfigModal = ({setModalVisible}: Props) => {
  const {store, createNewList} = useTodoLists();
  const [listName, setListName] = useState('');
  return (
    <ModalBody>
      <TextInput
        value={listName}
        onChangeText={setListName}
        placeholder={'Provide a list name'}
      />
      <Touchable
        onPress={() => {
          if (listName != null && listName !== '') {
            createNewList(listName);
            Keyboard.dismiss();
            setListName('');
          } else {
            Alert.alert('You must set a valid name');
          }
        }}>
        <Icon name="plus" size={26} color={'blue'} />
        <Text>Create List</Text>
      </Touchable>
      <Text label>Tap the icon to change which list is visible</Text>
      <FlatList<TodoList>
        data={store.todoLists}
        style={{maxHeight: 300}}
        renderItem={({item}) => {
          return <ListItem item={item} />;
        }}
        keyExtractor={(item) => item.id}
      />
      <Touchable
        onPress={() => {
          setModalVisible(false);
        }}>
        <Icon name="close" size={26} color={'blue'} />
        <Text>Close</Text>
      </Touchable>
    </ModalBody>
  );
};
