import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "../ui/button";
import { useState } from "react";

export type AlertProps = {
  title: string;
  description: string;
  closeIcon?: React.ReactNode;
  onClose?: () => void;
};

export function Alert({ title, description, closeIcon, onClose }: AlertProps) {
  const [visible, setVisible] = useState(true);
  const onCloseAlert = () => {
    if (onClose) {
      onClose();
      return;
    }
    setVisible(false);
  };

  return (
    visible && (
      <Card size="sm" className="mx-auto w-full max-w-xs pointer-events-auto">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <CardAction>
            <Button variant={"ghost"} onClick={onCloseAlert}>
              {closeIcon}
            </Button>
          </CardAction>
        </CardHeader>
      </Card>
    )
  );
}
