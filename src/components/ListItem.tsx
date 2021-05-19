import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from './elements/Text';
import {Icon} from './elements/Icon';
import {TodoList} from 'store/TodoListProvider';
import {useSelectedList} from 'store/SelectedListProvider';
import {Touchable} from './elements/Touchable';

interface Props {
  item: TodoList;
}

export const ListItem = ({item}: Props) => {
  const {selectedList, setSelectedList} = useSelectedList();
  return (
    <View style={styles.container}>
      <Touchable
        onPress={() => {
          setSelectedList(item.id);
        }}>
        <View style={styles.checkIconContainer}>
          {selectedList === item.id ? (
            <Icon name="circle" size={26} color={'blue'} />
          ) : (
            <Icon name="circle-thin" size={26} color={'blue'} />
          )}
        </View>
      </Touchable>
      <View style={styles.textContainer}>
        <Text>{item.name ?? ''}</Text>
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
