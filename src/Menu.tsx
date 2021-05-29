import React, {useEffect} from "react";
// import icon from './assets/logo.svg'
const icon = "data:image/svg+xml,%3Csvg stroke='%23eeeeee' fill='none' stroke-width='2' viewBox='0 0 24 24' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='18' cy='18' r='3'%3E%3C/circle%3E%3Ccircle cx='6' cy='6' r='3'%3E%3C/circle%3E%3Cpath d='M13 6h3a2 2 0 0 1 2 2v7'%3E%3C/path%3E%3Cline x1='6' y1='9' x2='6' y2='21'%3E%3C/line%3E%3C/svg%3E";

const { Titlebar, Color } = window.require('custom-electron-titlebar');
const { Menu, shell, app, dialog } = window.require('electron').remote;


const menuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New repository...',
        accelerator: 'CmdOrCtrl+N',
        click() {}
      },
      {
        label: 'Open repository...',
        accelerator: 'CmdOrCtrl+O',
        click() {}
      },
      {
        label: 'Clone repository...',
        accelerator: 'CmdOrCtrl+Shift+O',
        click() {}
      },
      { type: 'separator' },
      {
        label: "Options...",
        accelerator: 'CmdOrCtrl+,',
        click() {}
      },
      { type: 'separator' },
      { role: 'quit' },
    ]
  },
  { role: 'viewMenu' },
  {
    label: 'Repository',
    submenu: [
      {
        label: 'Push',
        accelerator: 'CmdOrCtrl+P',
        click() {}
      },
      {
        label: 'Pull',
        accelerator: 'CmdOrCtrl+Shift+P',
        click() {}
      },
      { type: 'separator' },
      {
        label: 'Repository settings...',
        click() {}
      },
    ]
  },
  {
    label: 'Branch',
    submenu: [
      {
        label: 'New Branch...',
        accelerator: 'CmdOrCtrl+Shift+N',
        click() {}
      },
      {
        label: 'Rename...',
        accelerator: 'CmdOrCtrl+Shift+R',
        click() {}
      },
      {
        label: 'Delete...',
        accelerator: 'CmdOrCtrl+Shift+D',
        click() {}
      },
      { type: 'separator' },
      {
        label: 'Discard all changes...',
        accelerator: 'CmdOrCtrl+Shift+Backspace',
        click() {}
      },
      { type: 'separator' },
      {
        label: 'Stash',
        accelerator: 'Alt+S',
        click() {}
      },
      {
        label: 'Pop Stash',
        accelerator: 'Alt+Shift+S',
        click() {}
      },
    ]
  },
  { role: 'windowMenu' },
  {
    role: 'help',
    submenu: [
      {
        label: "Homepage",
        async click() {
          shell.openExternal("https://github.com/JacksonBelizario/GitTree");
        }
      },
      { type: 'separator' },
      {
        label: "About",
        async click() {
          await dialog.showMessageBoxSync({
            type: "info",
            title: "GitTree",
            message: `
              Version: ${app.getVersion()}\n
              Author: Jackson Belizário\n
            `,
            defaultId: 1,
          });
        }
      },
    ]
  }
];

const menu = Menu.buildFromTemplate(menuTemplate);

const titleBar = new Titlebar({
  backgroundColor: Color.fromHex('#30404d'),
  unfocusEffect: true,
  titleHorizontalAlignment: "center",
  icon,
  menu,
});

titleBar.updateBackground(Color.fromHex('#30404d'));

interface TitleBarProps {
  title: string;
}

const TitleBarMenu = (props: TitleBarProps): JSX.Element => {
  const {title} = props;
  useEffect(() => {
    document.title = title;
    titleBar.updateTitle(title);
  }, [title]);

  return <></>;
}

export default TitleBarMenu;