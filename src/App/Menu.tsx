import React, {FunctionComponent, useEffect} from "react";

// import icon from './Assets/logo.svg'
const icon = "data:image/svg+xml,%3Csvg stroke='%23eeeeee' fill='none' stroke-width='2' viewBox='0 0 24 24' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='18' cy='18' r='3'%3E%3C/circle%3E%3Ccircle cx='6' cy='6' r='3'%3E%3C/circle%3E%3Cpath d='M13 6h3a2 2 0 0 1 2 2v7'%3E%3C/path%3E%3Cline x1='6' y1='9' x2='6' y2='21'%3E%3C/line%3E%3C/svg%3E";

const { Titlebar, Color } = window.require('custom-electron-titlebar');
const { Menu: { buildFromTemplate }, globalShortcut , shell, app, dialog, getCurrentWindow } = window.require('electron').remote;

type MenuProps = {
  title: string;
  openRepo: Function;
  repoStore?: any
};

class Dispatcher {
  private props: MenuProps;

  public setMenuProps(props: MenuProps) {
    this.props = props;
  }

  public onMenuEvent(name) {
    return () => {
      switch (name) {
        case 'open-repo':
          return this.props.openRepo();
        case 'settings':
          return this.props.repoStore ? this.props.repoStore.dispatch.settings.setShowSettings({show: true}) : null;
        case 'pull':
          return this.props.repoStore ? this.props.repoStore.dispatch.repo.pull(null): null;
        case 'push':
          return this.props.repoStore ? this.props.repoStore.dispatch.repo.push(null): null;
        default:
          return console.error(`Unknown menu event name: ${name}`);
      }
    }
  }
}

const dipatcher = new Dispatcher();

const menuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New repository...',
        accelerator: 'CmdOrCtrl+N',
        click: dipatcher.onMenuEvent('new-repo'),
        enabled: false
      },
      {
        label: 'Open repository...',
        accelerator: 'CmdOrCtrl+O',
        click: dipatcher.onMenuEvent('open-repo')
      },
      {
        label: 'Clone repository...',
        accelerator: 'CmdOrCtrl+Shift+O',
        click: dipatcher.onMenuEvent('clone-repo'),
        enabled: false
      },
      { type: 'separator' },
      {
        label: "Options...",
        accelerator: 'CmdOrCtrl+,',
        click: dipatcher.onMenuEvent('settings')
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
        click: dipatcher.onMenuEvent('push')
      },
      {
        label: 'Pull',
        accelerator: 'CmdOrCtrl+Shift+P',
        click: dipatcher.onMenuEvent('pull')
      },
      { type: 'separator' },
      {
        label: 'Repository settings...',
        click: dipatcher.onMenuEvent('settings')
      },
    ]
  },
  {
    label: 'Branch',
    submenu: [
      {
        label: 'New Branch...',
        accelerator: 'CmdOrCtrl+Shift+N',
        click: dipatcher.onMenuEvent('new-branch'),
        enabled: false
      },
      // {
      //   label: 'Rename...',
      //   accelerator: 'CmdOrCtrl+Shift+R',
      //   click: dipatcher.onMenuEvent('rename-branch'),
      //   enabled: false
      // },
      {
        label: 'Delete...',
        accelerator: 'CmdOrCtrl+Shift+D',
        click: dipatcher.onMenuEvent('delete-branch'),
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Discard all changes...',
        accelerator: 'CmdOrCtrl+Shift+Backspace',
        click: dipatcher.onMenuEvent('dicard-all-changes'),
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Stash',
        accelerator: 'Alt+S',
        click: dipatcher.onMenuEvent('stash'),
        enabled: false
      },
      {
        label: 'Pop Stash',
        accelerator: 'Alt+Shift+S',
        click: dipatcher.onMenuEvent('pop-stash'),
        enabled: false
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
          await dialog.showMessageBoxSync(getCurrentWindow(), {
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


(function registerShortcuts(menu){
  if (!Array.isArray(menu)) {
    return;
  }
  for(let cur of menu) {
    //@ts-ignore
    if (cur.accelerator) {
      //@ts-ignore
      globalShortcut.register(cur.accelerator, cur.click);
    }
    if (cur.submenu) {
      //@ts-ignore
      registerShortcuts(cur.submenu);
    }
  }
})(menuTemplate);

const menu = buildFromTemplate(menuTemplate);

const titleBar = new Titlebar({
  backgroundColor: Color.fromHex('#30404d'),
  unfocusEffect: true,
  titleHorizontalAlignment: "center",
  icon,
  menu,
});

titleBar.updateBackground(Color.fromHex('#30404d'));

const Menu: FunctionComponent<MenuProps> = (props): JSX.Element => {
  const {title} = props;
  
  useEffect(() => {
    dipatcher.setMenuProps(props);
  }, []); // eslint-disable-line
  
  useEffect(() => {
    document.title = title;
    titleBar.updateTitle(title);
  }, [title]);

  return <></>;
}

//@ts-ignore
export default Menu;