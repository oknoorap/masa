import { useCallback, useState, useRef, useEffect } from "react";
import { createContainer } from "unstated-next";
import { useDisclosure } from "@chakra-ui/react";

import { useDB, TaskSchema } from "hooks/use-database";

const useTaskHook = () => {
  const { isDbReady, tasksDBRef } = useDB();
  const {
    isOpen: isTodoInputVisible,
    onOpen: onTodoInputShow,
    onClose: onTodoInputHide,
  } = useDisclosure();
  const [todos, setTodos] = useState<string[]>([]);
  const addTodoInputRef = useRef<HTMLInputElement>();

  const addTask = useCallback(
    async (task: Omit<TaskSchema, "id">) => {
      if (!isDbReady) return;
      return await tasksDBRef.current.add(task);
    },
    [isDbReady]
  );

  const addTodo = useCallback(() => {
    if (!addTodoInputRef.current) return;
    const todo = addTodoInputRef.current.value;
    setTodos((todos) => [...todos, todo]);
    addTodoInputRef.current.value = "";
    addTodoInputRef.current.focus();
  }, []);

  const removeTodo = useCallback(
    (index: number) => {
      todos.splice(index, 1);
      setTodos(todos);
      onTodoInputHide();
    },
    [todos]
  );

  const resetTodos = useCallback(() => {
    setTodos(() => []);
  }, []);

  useEffect(() => {
    if (isTodoInputVisible && addTodoInputRef?.current) {
      addTodoInputRef.current.focus();
    }
  }, [isTodoInputVisible]);

  return {
    addTask,
    addTodo,
    removeTodo,
    resetTodos,
    todos,
    isTodoInputVisible,
    onTodoInputShow,
    onTodoInputHide,
    addTodoInputRef,
  };
};

const Container = createContainer(useTaskHook);

export const useTask = Container.useContainer;

export const TaskProvider = Container.Provider;

export default Container;
