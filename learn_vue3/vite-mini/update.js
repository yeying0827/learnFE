export function watch() {
    const watcher = chokidar.watch(appRoot, {
        ignored: ['**/node_modules/**', '**/.git/**'],
        ignoreInitial: true,
        ignorePermissionErrors: true,
        disableGlobbing: true
    });
    watcher;

    return watcher;
}

export function handleHMRUpdate(opts) {
    const { file, ws } = opts;
    const shortFile = getShortName(file, appRoot);
    const timestamp = Date.now();

    console.log(`[file change] ${chalk.dim(shortFile)}`);
    let updates;
    if (shortFile.endsWith('.css')) {
        updates = [
            {
                type: 'js-update',
                timestamp,
                path: `/${shortFile}`,
                acceptedPath: `/${shortFile}`
            }
        ];
    }

    ws.send({
        type: 'update',
        updates
    })
}

async function handleMessage(payload) {
    switch (payload.type) {
        case 'connected':
            console.log(`[vite] connected.`);
            setInterval(() => socket.send('ping'), 30000);
            break;
        case 'update':
            payload.updates.forEach(update => {
                if (update.type === 'js-update') {
                    fetchUpdate(update);
                }
            });
            break;
    }
}
