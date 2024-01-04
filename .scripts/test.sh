#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail
if [[ "${TRACE-0}" == "1" ]]; then
  set -o xtrace
fi

cd "$(dirname "$0")"

main() {
  export AWS_REGION=eu-central-1
  export NODE_OPTIONS=--enable-source-maps

  cd ..
  yarn build
  yarn mocha --parallel ./output/*.test.js
}

main "$@"
