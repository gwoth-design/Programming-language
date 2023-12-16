#include <iostream>
#include <cstdlib> 

int main(int argc, char* argv[]) {
    if (argc != 2) {
        return 1; 
    }
    std::string filename = argv[1];
    std::string command = "luminaLang.exe --allow-read " + filename;
    int result = system(command.c_str());
    if (result == 0) {
        return 0;
    } else {
        return 1;
    }
}
