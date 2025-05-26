import { set } from "date-fns";
import { AwardIcon, ThumbsDownIcon } from "lucide-react-native";
import * as React from "react";
import { TouchableOpacity } from "react-native";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Text } from "~/components/ui/text";

export default function useDecision({
  dialogTitle,
  yesButtonText,
  noButtonText,
}: {
  dialogTitle: string;
  yesButtonText: string;
  noButtonText?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [decisionResolver, setDecisionResolver] = React.useState<
    ((value: unknown) => void) | null
  >(null);

  const getDecision = () => {
    return new Promise((resolve) => {
      setOpen(true);

      setDecisionResolver(() => resolve);
    });
  };

  const handleSuccess = () => {
    if (!decisionResolver) return;

    decisionResolver(true);
    setOpen(false);
  };

  const handleFailure = () => {
    if (!decisionResolver) return;
    decisionResolver(false);

    setOpen(false);
  };

  const DecisionDialog = () => (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className=" sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            <Text className="text-2xl font-bold ">{dialogTitle}</Text>
          </DialogTitle>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-x-6 gap-y-3">
          <TouchableOpacity
            className="bg-purple-600 rounded-md px-5 py-4 flex flex-row items-center gap-x-1 min-w-[8rem] justify-center"
            onPress={handleFailure}
          >
            <Text className="text-lg font-semibold">{noButtonText}</Text>
            <ThumbsDownIcon color={"purple"} />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-green-600 rounded-md px-5 py-2 flex flex-row items-center gap-x-1 min-w-[8rem] justify-center"
            onPress={handleSuccess}
          >
            <Text className="text-lg font-semibold">{yesButtonText}</Text>
            <AwardIcon color={"green"} />
          </TouchableOpacity>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return {
    open,
    setOpen,
    DecisionDialog,
    getDecision,
  };
}
