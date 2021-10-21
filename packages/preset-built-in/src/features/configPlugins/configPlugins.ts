import { getSchemas } from '@umijs/bundler-webpack';
import { resolve } from '@umijs/utils';
import { dirname, join } from 'path';
import { IApi } from '../../types';

function resolveProjectDep(opts: { pkg: any; cwd: string; dep: string }) {
  if (
    opts.pkg.dependencies?.[opts.dep] ||
    opts.pkg.devDependencies?.[opts.dep]
  ) {
    return dirname(
      resolve.sync(`${opts.dep}/package`, {
        basedir: opts.cwd,
      }),
    );
  }
}

export default (api: IApi) => {
  const configDefaults: Record<string, any> = {
    alias: {
      // TODO: mfsu support dir alias
      umi: join(process.env.UMI_DIR!, 'index.esm.js'),
      '@umijs/renderer-react': require.resolve('@umijs/renderer-react'),
      react:
        resolveProjectDep({
          pkg: api.pkg,
          cwd: api.cwd,
          dep: 'react',
        }) || dirname(require.resolve('react/package')),
      'react-dom':
        resolveProjectDep({
          pkg: api.pkg,
          cwd: api.cwd,
          dep: 'react-dom',
        }) || dirname(require.resolve('react-dom/package')),
      'react-router': dirname(require.resolve('react-router/package')),
      'react-router-dom': dirname(require.resolve('react-router-dom/package')),
    },
    externals: {},
  };

  const bundleSchemas = getSchemas();
  for (const key of Object.keys(configDefaults)) {
    api.registerPlugins([
      {
        id: `virtual: config-${key}`,
        key: key,
        config: {
          default: configDefaults[key],
          schema: bundleSchemas[key] || ((joi) => joi.any()),
        },
      },
    ]);
  }
};