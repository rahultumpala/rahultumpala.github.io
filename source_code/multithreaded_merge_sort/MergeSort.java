package org.example;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.RecursiveTask;

public class MergeSort extends RecursiveTask<List<Integer>> {

    private List<Integer> nums;
    private Integer fileNum;

    protected MergeSort(List<Integer> nums, Integer fileNum) {
        this.nums = nums;
        this.fileNum = fileNum;
    }

    public static class Builder {
        private List<Integer> nums;
        private Integer totalFiles;
        private Integer fileNum;

        public Builder setNums(List<Integer> nums) {
            this.nums = nums;
            return this;
        }

        public Builder setFileNum(Integer fileNum) {
            this.fileNum = fileNum;
            return this;
        }

        public MergeSort build() {
            return new MergeSort(nums, fileNum);
        }
    }


    private List<Integer> readFile(int num) throws IOException {
        File f = new File("./numbers/"+num+".txt");
        assert f.canRead();
        FileReader r = new FileReader(f);
        BufferedReader reader = new BufferedReader(r);

        List<Integer> nums = new ArrayList<>();

        String line;
        while( (line = reader.readLine()) != null) {
            nums.add(Integer.parseInt(line));
        }

        return nums;
    }

    private List<Integer> merge(List<Integer> left, List<Integer> right){
        List<Integer> sorted = new ArrayList<>();
        int l = 0, r = 0;
        while(l < left.size() && r < right.size()){
            if(left.get(l) < right.get(r)) {
                sorted.add(left.get(l));
                l += 1;
            }else {
                sorted.add(right.get(r));
                r += 1;
            }
        }

        while(l < left.size()){
            sorted.add(left.get(l));
            l += 1;
        }

        while(r < right.size()){
            sorted.add(right.get(r));
            r += 1;
        }

        return sorted;
    }

    @Override
    protected List<Integer> compute() {

//        String name = Thread.currentThread().getName();
//        System.out.println("Received list " + this.nums + "in thread " + name);


        if(this.nums == null) {
            assert this.fileNum != null;
            try {
                this.nums = readFile(this.fileNum);
            } catch (Exception ignored) {}
        }
        assert this.nums != null;

        int length = this.nums.size();
        if(length <= 1) return this.nums;

        int mid = length/2;
        MergeSort left = new MergeSort.Builder().setNums(this.nums.subList(0, mid)).build();
        MergeSort right = new MergeSort.Builder().setNums(this.nums.subList(mid, length)).build();

        left.fork();
        right.fork();

        return this.merge(left.join(), right.join());
    }
}
