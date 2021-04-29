import { createContainer } from "unstated-next";

const useTaskHook = () => {};

const Container = createContainer(useTaskHook);

export const useTask = Container.useContainer;

export const TaskProvider = Container.Provider;

export default Container;
