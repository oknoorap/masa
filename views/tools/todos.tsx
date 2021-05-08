import { useState } from "react";
import {
  Flex,
  Box,
  Stack,
  UnorderedList,
  ListItem,
  Input,
  Button,
  IconButton,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";

import { useTask } from "hooks/use-task";

const TradeToolTodosView = () => {
  const {
    todos,
    isTodoInputVisible,
    onTodoInputShow,
    onTodoInputHide,
    addTodoInputRef,
    addTodo,
    removeTodo,
  } = useTask();
  const [task, setTask] = useState<string>();
  return (
    <Stack>
      {todos.length && (
        <UnorderedList ml="6" mb="2">
          {todos.map((item, index) => (
            <ListItem key={`todo-${index}`} py="1" role="group">
              <Flex position="relative">
                <Box as="span">{item}</Box>
                <CloseIcon
                  w="3"
                  position="absolute"
                  top="0"
                  right="0"
                  color="red.500"
                  cursor="pointer"
                  visibility="hidden"
                  _groupHover={{ visibility: "visible" }}
                  onClick={() => removeTodo(index)}
                />
              </Flex>
            </ListItem>
          ))}
        </UnorderedList>
      )}

      {!todos.length && (
        <Flex py="2" fontSize="sm" alignItems="center" color="gray.400">
          You don't have any task(s).
        </Flex>
      )}

      {isTodoInputVisible && (
        <Stack alignItems="flex-start">
          <Input
            ref={addTodoInputRef}
            placeholder="Add a task"
            onChange={(event) => setTask(event.currentTarget.value)}
          />
          <Stack direction="row">
            <Button size="sm" onClick={addTodo}>
              Add
            </Button>
            <IconButton
              aria-label="Cancel"
              icon={<CloseIcon />}
              size="sm"
              onClick={onTodoInputHide}
            />
          </Stack>
        </Stack>
      )}
      {!isTodoInputVisible && (
        <Box>
          <Button size="sm" onClick={onTodoInputShow}>
            Add Task
          </Button>
        </Box>
      )}
    </Stack>
  );
};

export default TradeToolTodosView;
