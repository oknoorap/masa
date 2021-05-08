import { FC, useState, useRef, FormEvent } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Flex,
  Stack,
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormErrorMessage,
  FormLabel,
  InputGroup,
  Input,
  Textarea,
  Button,
  Checkbox,
  NumberInput,
  InputRightAddon,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormErrorMessageProps,
} from "@chakra-ui/react";

import { TradeSchema, TaskSchema } from "hooks/use-database";
import { useTrade } from "hooks/use-trade";
import { useChart } from "hooks/use-chart";

import Todos from "./todos";

type SellForm = Pick<TradeSchema, "amount"> &
  Pick<
    TaskSchema,
    "title" | "description" | "achievement" | "todos" | "priority"
  >;

type TradeToolsSellFormProps = {
  isOpen: boolean;
  onClose: () => void;
};

const validation = {
  amount: {
    required: {
      value: true,
      message: "Amount is required",
    },
    valueAsNumber: true,
    min: { value: 10, message: "Minimum amount is 10" },
    max: { value: 100, message: "Maximum amont is 100" },
  },
  title: {
    required: { value: true, message: "Title is required" },
    minLength: {
      value: 3,
      message: "Title must be at least 3 characters long",
    },
    maxLength: {
      value: 60,
      message: "Maximum title is 60 characters",
    },
  },
  description: {
    required: {
      value: true,
      message: "Description is required",
    },
    minLength: {
      value: 5,
      message: "Description must be at least have 1 word or 5 characters long",
    },
    maxLength: {
      value: 160,
      message: "Maximum description is 160 characters long",
    },
  },
  achievement: {
    required: {
      value: true,
      message: "Achievement is required",
    },
    minLength: {
      value: 3,
      message: "Achievement must be at least 3 characters long",
    },
    maxLength: {
      value: 60,
      message: "Maximum achievement is 160 characters long",
    },
  },
};

const TradeToolsSellFormView: FC<TradeToolsSellFormProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    register,
  } = useForm<SellForm>();
  const { lastPrice, isPriceUp, isPriceStuck } = useChart();
  const { sell } = useTrade();
  const formRef = useRef<HTMLFormElement>();
  const [isAgree, setAgreement] = useState(false);
  const isValid = Object.keys(errors).length === 0;

  const errorMessageProps: FormErrorMessageProps = {
    mt: "1",
    fontSize: "xs",
    fontWeight: "bold",
  };

  const onSubmit = async ({
    amount,
    title,
    description,
    achievement,
    priority,
  }: SellForm) => {
    await sell(amount, parseFloat(lastPrice as string), {
      title,
      description,
      achievement,
      priority,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={!isSubmitting}
    >
      <ModalOverlay />
      <ModalContent color="dark.500">
        <ModalHeader>
          <Box>Sell $TIME</Box>
          <Stack
            direction="row"
            fontSize="x-small"
            textTransform="uppercase"
            spacing="1"
          >
            <Box as="span">Current Price</Box>
            <Box
              as="span"
              color={isPriceUp ? "green.500" : !isPriceStuck ? "red.500" : null}
            >
              {isPriceUp ? <>&#9650;</> : !isPriceStuck ? <>&#9660;</> : null}{" "}
              {lastPrice}
            </Box>
          </Stack>
        </ModalHeader>

        {!isSubmitting && <ModalCloseButton />}

        <ModalBody py="8" borderWidth="1px 0" borderColor="gray.300">
          <form ref={formRef}>
            <Stack spacing={4}>
              <FormControl id="country" isInvalid={Boolean(errors.amount)}>
                <FormLabel>Amount</FormLabel>
                <InputGroup justifyContent="stretch">
                  <NumberInput
                    flex={1}
                    max={100}
                    min={10}
                    defaultValue={10}
                    step={1}
                    precision={8}
                  >
                    <NumberInputField
                      {...register("amount", validation.amount)}
                    />
                    <NumberInputStepper
                      sx={{ svg: { width: "2", height: "auto" } }}
                    >
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <InputRightAddon
                    fontSize="sm"
                    fontWeight="bold"
                    children="$TIME"
                  />
                </InputGroup>
                <FormErrorMessage {...errorMessageProps}>
                  {errors.amount?.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={Boolean(errors.title)}>
                <FormLabel>Title</FormLabel>
                <Input
                  placeholder="e.g Working Out"
                  {...register("title", validation.title)}
                />
                <FormErrorMessage {...errorMessageProps}>
                  {errors.title?.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={Boolean(errors.description)}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="Describe your activity"
                  {...register("description", validation.description)}
                />
                <FormErrorMessage {...errorMessageProps}>
                  {errors.description?.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={Boolean(errors.achievement)}>
                <FormLabel>Achievement</FormLabel>
                <Input
                  placeholder="e.g Become strong"
                  {...register("achievement", validation.achievement)}
                />
                <FormErrorMessage {...errorMessageProps}>
                  {errors.achievement?.message}
                </FormErrorMessage>
              </FormControl>

              <Box className="chakra-form-control" w="100%" position="relative">
                <FormLabel>To do lists</FormLabel>
                <Todos />
              </Box>
            </Stack>
          </form>
        </ModalBody>
        <ModalFooter bgColor="gray.100" flexDir="column" w="full">
          <Flex
            mb="4"
            fontSize="xs"
            color="gray.500"
            cursor="default"
            onClick={() => setAgreement((isAgree) => !isAgree)}
          >
            <Box py="1">
              <Checkbox
                mr="2"
                bgColor="white"
                borderColor="gray.500"
                pointerEvents="none"
                isChecked={isAgree}
              />
            </Box>
            <Box as="span">
              This action can't be undone. You can't change{" "}
              <strong>title</strong>, <strong>description</strong> and{" "}
              <strong>achievement</strong> after submit this form (except to do
              lists). Please make sure you fill the form correctly.
            </Box>
          </Flex>

          <Stack direction="row" w="full">
            <Button
              colorScheme="blue-ribbon"
              size="lg"
              w="50%"
              isLoading={isSubmitting}
              loadingText="Submitting..."
              isDisabled={!isAgree || !isValid}
              onClick={handleSubmit(onSubmit)}
            >
              Sell $TIME
            </Button>
            <Button
              size="lg"
              w="50%"
              onClick={onClose}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
          </Stack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TradeToolsSellFormView;
