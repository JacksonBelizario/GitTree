import { Position, Toaster, Intent, IActionProps, ILinkProps } from "@blueprintjs/core";
import {IconNames} from "@blueprintjs/icons";
 
/** Singleton toaster instance. Create separate instances for different options. */
export const AppToaster = Toaster.create({
  className: "recipe-toaster",
  position: Position.TOP_RIGHT,
});

export const showInfo = (message : React.ReactNode, action?: IActionProps & ILinkProps) => {
  AppToaster.show({
    icon: IconNames.INFO_SIGN,
    intent: Intent.PRIMARY,
    message,
    action,
  })
}

export const showSuccess = (message : React.ReactNode, action?: IActionProps & ILinkProps) => {
  AppToaster.show({
    icon: IconNames.TICK_CIRCLE,
    intent: Intent.SUCCESS,
    message,
    action,
  })
}

export const showDanger = (message : React.ReactNode, action?: IActionProps & ILinkProps) => {
  AppToaster.show({
    icon: IconNames.WARNING_SIGN,
    intent: Intent.DANGER,
    message,
    action,
  })
}

export const showWarning = (message : React.ReactNode, action?: IActionProps & ILinkProps) => {
  AppToaster.show({
    icon: IconNames.WARNING_SIGN,
    intent: Intent.WARNING,
    message,
    action,
  })
}
