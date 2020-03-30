# command (what the commands look like)
testOutput () {
    # read from var
    if [ "${2}" == "output" ]; then
        local output_length=$(echo "${1}" | jq -r --arg v "${3}" '.[$v] | length')
    else
        local output_length=$(echo "${1}" | jq '. | length')
    fi
    echo "$output_length"
}

# command (what the commands look like) (doesn't matter for control)
# how many commands exist
testFile () {
    if [ "${2}" == "output" ]; then
        local file_length=$(jq -r --arg v "${3}" '.[$v] | length' ${1})
    else
        local file_length=$(jq -r '. | length' ${1})
    fi
    # read from file
    echo "$file_length"
}

prepareTest () {
    # declare a new variable ex. output
    if [ "$1" == "real" ]; then
        declare -n file=${2} # set var ex output
    else
        declare -n file=${1}${2} # set var ex control_output
    fi
    if [ "$dev" == "dev" ] || [ "$1" == "control_" ]; then
        # set ex. output to file ex. events/{order}/output/{command}/output.json
        file="$(cat workspace/${3}/output/${5}/${4}/${!file}.json)"
    fi
    echo "${file}"
}

testFailure () {
    echo -e "\t\033[1;91mTest failure $2/$4/$3/$6/($1):$5.json { EXPECTED:$8 RECEIVED:$7 } \033[0m"
    exit 1;
}

# testResults $prefix "$order" "$command" "$branch" "file_name" "test_type" "$test_input" 
testResults () {
    expected=0
    if [ "$2" == "false" ]; then
        if [ "$3" == "simple" ] || [ "$3" == "complex" ]; then
            if [[ "$6" == *"has_deploy"* ]]; then
                local expected=3
            elif [[ "$6" == *"has_delete"* ]]; then
                local expected=1
            fi
        fi
    elif [ "$2" == "simple" ]; then
        if [ "$3" == "simple" ] || [ "$3" == "complex" ]; then
            if [ "$4" == "master" ]; then
                if [[ "$6" == *"has_deploy"* ]]; then
                    local expected=2
                elif [[ "$6" == *"has_delete"* ]]; then
                    local expected=1
                fi
            elif [ "$4" == "develop" ]; then
                if [[ "$6" == *"has_deploy"* ]]; then
                    local expected=1
                fi
            fi
        fi
    elif [ "$2" == "advanced" ]; then
        if [ "$3" == "simple" ] || [ "$3" == "complex" ]; then
            if [ "$4" == "master" ]; then
                if [[ "$6" == *"has_deploy"* ]]; then
                    local expected=2
                elif [[ "$6" == *"has_delete"* ]]; then
                    local expected=1
                elif [[ "$6" == *"has_prefix"* ]]; then
                    local expected=1
                elif [[ "$6" == *"has_suffix"* ]]; then
                    local expected=1
                elif [[ "$6" == *"has_validate"* ]]; then
                    local expected=4
                fi
            elif [ "$4" == "develop" ]; then
                if [[ "$6" == *"has_deploy"* ]]; then
                    local expected=1
                elif [[ "$6" == *"has_validate"* ]]; then
                    local expected=1
                fi
            fi
        fi
    fi
    if [ "$7" != "$expected" ]; then
        testFailure $1 $2 $3 $4 $5 $6 $7 $expected;
    fi
    if [ "$7" != "0" ]; then
        echo -e "\t\033[1;92mTest success $2/$4/$3/$6/($1):$5.json { $expected == $7 } \033[0m"
    fi
}

# runTest $file "$order" "$command" "$template_nested"
runTest () {
    # do 2 tests a control and a real test
    for test_prefix in "control_" "real"; do \
        # set file to ex. output.json
        file=${1}.json
        if [ "$test_prefix" == 'control_' ] || [ "$dev" == "dev" ]; then
            file=workspace/${2}/output/${4}/${3}/${1}.json # if control or dev set file to test specific file
        fi
        input="$(prepareTest $test_prefix $1 "$2" "$3" "$4")"
        if [ "${1}" == "output" ]; then
            local has_deploy_file=$(testFile $file "${1}" deploy)
            testResults $test_prefix "${2}" "${3}" "${4}" "$1" "has_deploy_file" "$has_deploy_file"
            local has_deploy_output=$(testOutput "${input}" "${1}" deploy)
            testResults $test_prefix "${2}" "${3}" "${4}" "$1" "has_deploy_output" "$has_deploy_output"
            local has_delete_file=$(testFile $file "${1}" delete)
            testResults $test_prefix "${2}" "${3}" "${4}" "$1" "has_delete_file" "$has_delete_file"
            local has_delete_output=$(testOutput "${input}" "${1}" delete)
            testResults $test_prefix "${2}" "${3}" "${4}" "$1" "has_delete_output" "$has_delete_output"
            local has_validate_file=$(testFile $file "${1}" validate)
            testResults $test_prefix "${2}" "${3}" "${4}" "$1" "has_validate_file" "$has_validate_file"
            local has_validate_output=$(testOutput "${input}" "${1}" validate)
            testResults $test_prefix "${2}" "${3}" "${4}" "$1" "has_validate_output" "$has_validate_output"
            local has_prefix_file=$(testFile $file "${1}" prefix)
            testResults $test_prefix "${2}" "${3}" "${4}" "$1" "has_prefix_file" "$has_prefix_file"
            local has_prefix_output=$(testOutput "${input}" "${1}" prefix)
            testResults $test_prefix "${2}" "${3}" "${4}" "$1" "has_prefix_output" "$has_prefix_output"
            local has_suffix_file=$(testFile $file "${1}" suffix)
            testResults $test_prefix "${2}" "${3}" "${4}" "$1" "has_suffix_file" "$has_suffix_file"
            local has_suffix_output=$(testOutput "${input}" "${1}" suffix)
            testResults $test_prefix "${2}" "${3}" "${4}" "$1" "has_suffix_output" "$has_suffix_output"
        else
            local has_array_file=$(testFile $file "${1}")
            testResults $test_prefix "${2}" "${3}" "${4}" "$1" "has_${1}_file" "$has_array_file"
            local has_array_output=$(testOutput "${input}" "${1}")
            testResults $test_prefix "${2}" "${3}" "${4}" "$1" "has_${1}_output" "$has_array_output"

        fi
    done
}

test () {
    if [ "$dev" == "dev" ]; then
        echo -e "\t\033[1;91mDEV MODE\033[0m"
    fi
    if [ "$order" == "" ] && [ "$command" == "" ] && [ "$branch" == "" ]; then
        for order in "advanced" "simple" "false"; do \
            echo -e "\033[1;92mORDER:'$order'\033[0m"
            for command in "simple" "complex"; do \
                echo -e "\033[1;92mCOMMAND:'$command'\033[0m"
                for branch in "master" "develop"; do \
                    echo -e "\033[1;92mBRANCH:'$branch'\033[0m"
                    for file in "output" "deploy" "delete" "prefix" "suffix" "validate"; do \
                        echo -e "\033[1;92mFILE:'$file'\033[0m"
                        runTest $file "$order" "$command" "$branch"
                    done
                done
            done
        done
    else
        for file in "output" "deploy" "delete" "prefix" "suffix" "validate"; do \
            echo -e "\033[1;92mFILE:'$file' with ORDER:'$order' COMMAND:'$command' BRANCH:'$branch'\033[0m"
            runTest $file "$order" "$command" "$branch"
        done
    fi
}

dev=$1

test
