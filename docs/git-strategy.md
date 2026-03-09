# Git Strategy (팀 공통 운용안)

이 문서는 이 레포에서 `rebase`와 `merge`를 혼용할 때의 기준을 정리합니다.

## 1) 원칙

1. 개인 작업 브랜치 최신화는 `rebase` 우선
2. 공유 브랜치(`main` 포함) 히스토리 재작성 금지
3. MR 머지 방식은 팀 정책 1개로 고정
4. 커밋 메시지는 Conventional Commits + 한국어 subject 유지

## 2) `rebase` vs `merge` 사용 기준

### `rebase`를 쓸 때

- 내 로컬 feature 브랜치에서 `main` 최신을 반영할 때
- MR 올리기 전 커밋 히스토리를 정리할 때
- 아직 다른 사람이 해당 브랜치를 기준으로 작업하지 않을 때

### `merge`를 쓸 때

- 이미 원격에 공유된 브랜치에서 최신 반영이 필요할 때
- 히스토리 보존이 중요한 통합 시점
- 공개 이력 재작성 리스크를 피해야 할 때

## 3) 브랜치 정책

- 기준 브랜치: `main`
- 작업 브랜치 네이밍:
  - `feat/<topic>`
  - `fix/<topic>`
  - `docs/<topic>`
  - `chore/<topic>`

## 4) 권장 워크플로우

1. 브랜치 생성

```bash
git switch main
git pull origin main --ff-only
git switch -c docs/example-topic
```

2. 작업 후 커밋

```bash
git add .
git commit -m "docs(readme): 실행 가이드 정리"
```

3. MR 전 최신 반영(개인 브랜치)

```bash
git fetch origin
git rebase origin/main
```

4. 충돌 해결 후 푸시

```bash
git push -u origin docs/example-topic
```

리베이스 후 원격에 이미 푸시한 브랜치를 갱신해야 하면:

```bash
git push --force-with-lease
```

## 5) MR 머지 방식 권장

팀 기본값은 아래 중 하나로 고정:

1. `Squash and merge` 권장

- 장점: `main` 히스토리 간결, 릴리즈 노트 관리 쉬움
- 조건: MR 본문에 변경 맥락을 충분히 기록

2. `Merge commit` 대안

- 장점: 분기 맥락 보존
- 단점: 히스토리 복잡도 증가

`Rebase and merge`는 팀원 Git 숙련도와 충돌 처리 역량이 충분할 때만 채택.

## 6) 금지/주의 사항

- `main`에서 직접 작업/직접 푸시 금지
- 공개 브랜치에서 무분별한 `rebase` 금지
- `git push --force` 단독 사용 금지 (`--force-with-lease`만 허용)
- 대규모 변경은 docs/코드/인프라를 한 MR에 과도하게 혼합하지 않기

## 7) 운영 체크리스트

- [ ] 브랜치가 `main` 최신 기준으로 생성되었는가
- [ ] 커밋 메시지가 규칙을 준수하는가
- [ ] MR 본문에 Why/What/Scope/HowToTest가 있는가
- [ ] 머지 방식이 팀 기본 정책과 일치하는가
- [ ] 리스크/롤백 방법이 명시되었는가
