#!/usr/bin/env node

import NodeMenu = require('node-menu');
import { EColor } from '../vendor/utils/typescript/src/enum/Ecolor';
import { Console } from '../vendor/utils/typescript/src/lib/console/console';
import { FileSystem } from '../vendor/utils/typescript/src/lib/file-system';
import { Logger } from '../vendor/utils/typescript/src/lib/logger';

export class PortainerManager {
    private readonly menu: NodeMenu = require('node-menu');
    private readonly delimiterWithTitle: number = 40;
    private utilsFileSystem: FileSystem;
    private utilsConsole: Console;

    constructor() {
        this.utilsFileSystem = new FileSystem();
        this.utilsConsole = new Console(this.utilsFileSystem);
        this.canStart();
    }

    private canStart() {
        const sudo = !this.utilsFileSystem.isWindows ? 'sudo' : '';
        const resp = this.utilsConsole.execSync({ cmd: `${sudo} docker ps`, isThrow: false, verbose: false });
        if (resp.hasError) {
            Logger.log(resp.error.message, false, EColor.red);
            this.utilsConsole.waitForAnyKeyboard('Press any key to exit...', true);
        }
    }

    private showLinkMessage() {
        Logger.info('Access to link: https://localhost:9443');
    }

    private install() {
        const cmds: string[] = [
            'docker rm --force portainer',
            'docker rmi portainer/portainer-ce',
            'docker volume rm portainer_data',
            'docker volume create portainer_data',
            'docker run -d -p 8000:8000 -p 9443:9443 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:latest',
        ];
        cmds.forEach((cmd) => this.utilsConsole.execSyncRealTime({ cmd: cmd, isThrow: false }));
        this.showLinkMessage();
    }

    private startRestart(isRestart?: boolean) {
        const sudo = !this.utilsFileSystem.isWindows ? 'sudo' : '';
        if (isRestart) {
            this.utilsConsole.execSyncRealTime({ cmd: `${sudo} docker restart portainer`, isThrow: false });
        } else {
            this.utilsConsole.execSyncRealTime({ cmd: `${sudo} docker start portainer`, isThrow: false });
        }
        this.showLinkMessage();
    }

    public process() {
        this.menu.customHeader(() => {
            const title = 'Install/Upgrade/Start/Restart Portainer';
            Logger.log(title, true, EColor.gray);
        }).disableDefaultHeader().disableDefaultPrompt();
        this.menu.addDelimiter('*', this.delimiterWithTitle, 'Main');
        this.menu.addItem('Install/Re-Install/Upgrade', () => this.install(), this);
        this.menu.addItem('Start', () => this.startRestart(), this);
        this.menu.addItem('Restart', () => this.startRestart(true), this);
        this.menu.start();
    }

    public static start() {
        const portainter = new PortainerManager();
        portainter.process();
    }
}
PortainerManager.start();
