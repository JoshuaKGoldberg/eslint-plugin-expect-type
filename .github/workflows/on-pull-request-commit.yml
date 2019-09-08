name: CI
on:
  pull_request:
    branches:
      - master
jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - name: npm install, build and test
        run: |
          npm install
          npm run build
