#include <iostream>
#include <emscripten.h>

extern "C" {
    EMSCRIPTEN_KEEPALIVE
    int add(int x, int y) {
        return x + y;
    }
}

int main(int argc, char **argv) {
    std::cout << add(10, 20) << std::endl;
    return 0;
}
