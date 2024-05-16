package org.example;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.ForkJoinWorkerThread;

public class Main {

    public static List<Integer> readFile(int num) throws IOException {
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

    public static List<Integer> merge(List<Integer> left, List<Integer> right){
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



    public static List<Integer> mergeSort(List<Integer> nums){
        int len = nums.size();
        if(len == 1) return nums;
        int mid = nums.size() / 2;

        List<Integer> left = mergeSort(nums.subList(0, mid));
        List<Integer> right = mergeSort(nums.subList(mid, len));

        return merge(left, right);
    }

    public static void singleThread(int numFiles) throws Exception {
        long t1 = System.currentTimeMillis();
        for(int i = 0; i < numFiles; i++){
            List<Integer> nums = readFile(i);
            nums = mergeSort(nums);
        }
        long t2 = System.currentTimeMillis();
        System.out.println("Single Threaded Sort duration : " + (t2-t1) + " milliseconds");
    }


    public static void main(String[] args) throws Exception {
//        createAndWrite(100, 1000000);
        singleThread(100);
        multiThreaded(100);
    }

    public static void multiThreaded(int numFiles) {
        ForkJoinPool.ForkJoinWorkerThreadFactory factory = new ForkJoinPool.ForkJoinWorkerThreadFactory() {
            @Override
            public ForkJoinWorkerThread newThread(ForkJoinPool pool) {
                ForkJoinWorkerThread worker = ForkJoinPool.defaultForkJoinWorkerThreadFactory.newThread(pool);
                worker.setName("executor-" + worker.getPoolIndex());
                return worker;
            }
        };

        ForkJoinPool pool = new ForkJoinPool(Runtime.getRuntime().availableProcessors(), factory, null, false);

        long t1 = System.currentTimeMillis();

        for (int fileNum = 0; fileNum < numFiles ; fileNum++) {
            MergeSort multiThreadedSortInstance = new MergeSort.Builder().setFileNum(fileNum).build();
            List<Integer> sorted = pool.invoke(multiThreadedSortInstance);
        }

        long t2 = System.currentTimeMillis();
        System.out.println("MultiThreaded Sort duration : " + (t2-t1) + " milliseconds");
    }

    public static void createAndWrite(int numFiles, int size) throws Exception {
        for (int f = 0; f < numFiles; f++) {
            List<Integer> nums = new ArrayList<>();
            Random random = new Random();
            for (int i = 0; i < size; i++) {
                nums.add( random.nextInt(1000000));
            }
            writeToFile(nums, f);
        }
    }

    public static void writeToFile(List<Integer> nums, int fileNum) throws Exception {
        File f = new File("./numbers/"+fileNum+".txt");
        f.createNewFile();
        FileWriter r = new FileWriter(f.getAbsolutePath(), StandardCharsets.UTF_8);
        for(int i = 0; i < nums.size(); i++) {
            r.write( nums.get(i).toString() );
            if(i != nums.size() - 1)
                r.write("\n");
        }
        r.close();
    }

}