# Kiểm chứng đường dẫn plugin

Ngày chạy: 2026-07-27
Hạng mục chặn v1 số 1 và số 3 của spec mục 11.

## Kết quả

CWD lúc chạy: `/private/tmp/antislop-probe-cwd`, nằm ngoài repo. Đó là điều kiện của phép thử.

| Harness | Đọc `../../references/probe.txt` | Chạy `node ../../bin/probe.mjs` | Đường dẫn resolve tới |
|---|---|---|---|
| Claude Code | **PASS** | **PASS** | `~/Projects/antislop-marketing/` (repo sống) |
| Codex | **PASS** | **PASS** | `~/.codex/plugins/cache/antislop-marketing/antislop-marketing/0.1.0/` (bản sao) |

## LAYOUT=root

Giữ `references/` và `bin/` ở gốc plugin. Không cần phương án dự phòng lồng vào `skills/antislop-write/`.

Hệ quả: `counted_source` đạt được `"scan"` ở cả hai harness, nên cơ chế tất định ở spec mục 9 dùng được thật chứ không chỉ trong CI.

## Khác biệt vận hành, quan trọng khi phát triển

**Claude Code trỏ thẳng vào repo sống.** Sửa file trong repo là có hiệu lực ngay, không cần cài lại.

**Codex sao chép vào cache lúc cài.** Sửa file trong repo **không** có hiệu lực cho tới khi cài lại. Trong lúc phát triển, sau mỗi lần đổi `references/` hoặc `bin/`:

```bash
codex plugin remove antislop-marketing@antislop-marketing
codex plugin marketplace remove antislop-marketing
codex plugin marketplace add "$PWD"
codex plugin add antislop-marketing@antislop-marketing
```

Đây là lý do runner tầng 2 phải cài lại mỗi lần chạy chứ không dựa vào bản đã cài sẵn: trên Codex, bản đã cài có thể là code cũ.

## Codex đọc manifest nào

Codex đọc `.claude-plugin/marketplace.json`, **không** đọc `.codex-plugin/`. Thư mục `.codex-plugin/plugin.json` vẫn giữ cho khối `interface` (displayName, category, defaultPrompt) mà Codex dùng khi hiển thị plugin, nhưng phần khai báo marketplace thì dùng chung với Claude Code.

## Headless install: lệnh đã chốt

Cả hai đều chạy được không cần REPL.

```bash
# Claude Code
claude plugin marketplace add "$REPO"
claude plugin install antislop-marketing@antislop-marketing
claude plugin uninstall antislop-marketing@antislop-marketing
claude plugin marketplace remove antislop-marketing

# Codex
codex plugin marketplace add "$REPO"
codex plugin add antislop-marketing@antislop-marketing
codex plugin remove antislop-marketing@antislop-marketing
codex plugin marketplace remove antislop-marketing
```

Một lưu ý cho `codex exec`: nó từ chối chạy ở thư mục không phải git repo, nên runner phải thêm `--skip-git-repo-check` hoặc `git init` ở thư mục tạm.

```bash
codex exec --skip-git-repo-check "<prompt>" < /dev/null
```

`< /dev/null` là bắt buộc, không có nó `codex exec` treo chờ stdin.
