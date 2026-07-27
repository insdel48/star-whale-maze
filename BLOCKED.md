# 待裁决清单

## 1. 重标云朵列车
- 取证：森林路线总体沿插画道路；云朵列车复用森林坐标后，路线明显横穿花田、水面和建筑。
- 截图：见 PROGRESS.md 任务 1 的两张绝对路径。
- 影响：第二部当前能玩，但视觉道路与可走路线明显不一致。
- 待裁决：是否另开工作重标云朵列车；本次按既定决定只取证，不擅自重画。

## 已解除的权限阻塞
- 用户已明确授权；`optimize-foundation` 分支创建成功，本机 8000 端口预览已启动。

## 2. 自动创建 Pull Request
- `optimize-foundation` 已成功推送到 `origin`，但 GitHub 集成创建 PR 返回 403 `Resource not accessible by integration`。
- 本机 `gh auth status` 同时显示账号 `insdel48` 的 token 已失效，因此无法用 CLI 后备方式创建 PR。
- 请重新登录 GitHub 后，从 `main` 合并 `optimize-foundation`，或打开：`https://github.com/insdel48/star-whale-maze/compare/main...optimize-foundation?expand=1`。
