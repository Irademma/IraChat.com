async function testAppPerformance() {
  console.log("⚡ Testing IraChat App Performance...");

  const performanceTests = [
    {
      name: "Initial Load Time",
      test: async () => {
        const startTime = Date.now();
        const response = await fetch("http://localhost:8082");
        const endTime = Date.now();
        const loadTime = endTime - startTime;

        console.log(`   📊 Load time: ${loadTime}ms`);
        return { success: loadTime < 3000, value: loadTime, unit: "ms" };
      },
    },
    {
      name: "Response Size",
      test: async () => {
        const response = await fetch("http://localhost:8082");
        const html = await response.text();
        const sizeKB = (html.length / 1024).toFixed(2);

        console.log(`   📊 Response size: ${sizeKB}KB`);
        return {
          success: parseFloat(sizeKB) < 1000,
          value: sizeKB,
          unit: "KB",
        };
      },
    },
    {
      name: "Server Response Time",
      test: async () => {
        const tests = [];
        for (let i = 0; i < 3; i++) {
          const startTime = Date.now();
          await fetch("http://localhost:8082", { method: "HEAD" });
          const endTime = Date.now();
          tests.push(endTime - startTime);
        }

        const avgTime = Math.round(
          tests.reduce((a, b) => a + b) / tests.length,
        );
        console.log(`   📊 Average response time: ${avgTime}ms`);
        return { success: avgTime < 1000, value: avgTime, unit: "ms" };
      },
    },
    {
      name: "Concurrent Requests",
      test: async () => {
        const startTime = Date.now();
        const promises = Array(5)
          .fill()
          .map(() => fetch("http://localhost:8082", { method: "HEAD" }));

        await Promise.all(promises);
        const endTime = Date.now();
        const totalTime = endTime - startTime;

        console.log(`   📊 5 concurrent requests: ${totalTime}ms`);
        return { success: totalTime < 5000, value: totalTime, unit: "ms" };
      },
    },
  ];

  console.log("🚀 Running performance tests...\n");

  let passedTests = 0;
  let totalTests = performanceTests.length;
  const results = {};

  for (const test of performanceTests) {
    try {
      console.log(`🔄 Testing ${test.name}...`);
      const result = await test.test();

      if (result.success) {
        console.log(`✅ ${test.name}: PASSED`);
        passedTests++;
      } else {
        console.log(`⚠️ ${test.name}: SLOW (but functional)`);
      }

      results[test.name] = result;
      console.log("");
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}\n`);
    }
  }

  console.log(
    `📊 Performance Results: ${passedTests}/${totalTests} tests optimal`,
  );

  // Performance summary
  console.log("\n📈 Performance Summary:");
  Object.entries(results).forEach(([name, result]) => {
    const status = result.success ? "🟢" : "🟡";
    console.log(`${status} ${name}: ${result.value}${result.unit}`);
  });

  // Performance recommendations
  console.log("\n💡 Performance Analysis:");

  if (results["Initial Load Time"]?.value < 1000) {
    console.log("✅ Excellent load time - Users will have a smooth experience");
  } else if (results["Initial Load Time"]?.value < 3000) {
    console.log("✅ Good load time - Acceptable for web applications");
  } else {
    console.log("⚠️ Consider optimizing bundle size and server response");
  }

  if (results["Response Size"]?.value < 100) {
    console.log("✅ Lightweight app - Great for mobile users");
  } else if (results["Response Size"]?.value < 500) {
    console.log(
      "✅ Reasonable size - Good balance of features and performance",
    );
  } else {
    console.log("⚠️ Consider code splitting and lazy loading");
  }

  console.log("\n🎯 Platform Performance Expectations:");
  console.log("🌐 Web: Optimized for modern browsers");
  console.log("📱 Mobile: React Native performance benefits");
  console.log("⚡ Expo Go: Development mode (production will be faster)");

  console.log("\n🎉 Performance Testing Complete!");
}

testAppPerformance();
