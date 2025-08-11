#include <vector>
#include <algorithm>
#include <cmath>

class Solution {
public:
    int findRadius(std::vector<int>& A, std::vector<int>& B) {
        std::sort(B.begin(), B.end());

        int max_radius = 0;

        for (int building_pos : A) {
            auto it = std::lower_bound(B.begin(), B.end(), building_pos);

            int min_radius_for_building = -1;

            if (it != B.end()) {
                min_radius_for_building = std::abs(building_pos - *it);
            }

            if (it != B.begin()) {
                auto prev_it = std::prev(it);
                int dist_prev = std::abs(building_pos - *prev_it);
                if (min_radius_for_building == -1 || dist_prev < min_radius_for_building) {
                    min_radius_for_building = dist_prev;
                }
            }

            if (min_radius_for_building > max_radius) {
                max_radius = min_radius_for_building;
            }
        }

        return max_radius;
    }
};