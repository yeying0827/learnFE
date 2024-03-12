#include <emscripten.h>

extern "C" {
    EMSCRIPTEN_KEEPALIVE int increase (int x) {
        return x + 1;
    }
}